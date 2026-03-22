import { Client } from '@modelcontextprotocol/sdk/client';

export interface NotionPageParams {
  title: string;
  parent: { type: 'workspace'; workspace: boolean } | { page_id: string } | { database_id: string };
  icon?: string;
  children?: any[];
}

export class NotionManager {
  constructor(private client: Client) {}

  private extractId(result: any): string {
    if (result.isError) {
      throw new Error(`MCP Tool Error: ${JSON.stringify(result.content)}`);
    }
    try {
      const content = result.content[0].text;
      const data = JSON.parse(content);
      return data.id;
    } catch (e) {
      if (result.id) return result.id;
      throw new Error('Could not parse Notion response ID');
    }
  }

  async createPage(params: NotionPageParams): Promise<string> {
    const args: any = {
      parent: params.parent,
      properties: {
        title: {
          title: [{ type: 'text', text: { content: params.title } }]
        }
      }
    };

    if (params.icon) {
      args.icon = { type: 'emoji', emoji: params.icon };
    }

    const result = await this.client.callTool({
      name: 'API-post-page',
      arguments: args
    });

    return this.extractId(result);
  }

  async appendParagraph(blockId: string, content: string): Promise<void> {
    await this.client.callTool({
      name: 'API-patch-block-children',
      arguments: {
        block_id: blockId,
        children: [
          {
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content } }]
            }
          }
        ]
      }
    });
  }

  private parseMarkdownRichText(text: string): any[] {
    const parts: any[] = [];
    const regex = /(\*\*.*?\*\*)/g;
    const splitText = text.split(regex);

    for (const part of splitText) {
      if (part.startsWith('**') && part.endsWith('**')) {
        parts.push({
          type: 'text',
          text: { content: part.slice(2, -2) },
          annotations: { bold: true }
        });
      } else if (part.length > 0) {
        parts.push({
          type: 'text',
          text: { content: part }
        });
      }
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', text: { content: text } }];
  }

  async appendLongText(blockId: string, text: string): Promise<void> {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    
    const children = lines.map(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('#')) {
        const content = trimmed.replace(/^#+\s*/, '');
        return {
          type: 'heading_3',
          heading_3: {
            rich_text: this.parseMarkdownRichText(content)
          }
        };
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.replace(/^[-*]\s*/, '');
        return {
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: this.parseMarkdownRichText(content)
          }
        };
      }

      return {
        type: 'paragraph',
        paragraph: {
          rich_text: this.parseMarkdownRichText(trimmed)
        }
      };
    });

    for (let i = 0; i < children.length; i += 100) {
      await this.client.callTool({
        name: 'API-patch-block-children',
        arguments: {
          block_id: blockId,
          children: children.slice(i, i + 100)
        }
      });
    }
  }
  async appendBulletedList(blockId: string, items: string[]): Promise<void> {
    const listItems = items.filter(item => item.trim() !== '').map(item => ({
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: item } }]
      }
    }));

    await this.client.callTool({
      name: 'API-patch-block-children',
      arguments: {
        block_id: blockId,
        children: listItems
      }
    });
  }
  async searchPages(query?: string): Promise<any[]> {
    const result = await this.client.callTool({
      name: 'API-post-search',
      arguments: {
        query: query || '',
        filter: { property: 'object', value: 'page' },
        sort: { direction: 'descending', timestamp: 'last_edited_time' }
      }
    });

    if (result.isError) return [];
    
    try {
      const data = JSON.parse((result as any).content[0].text);
      return data.results || [];
    } catch {
      return [];
    }
  }
}
