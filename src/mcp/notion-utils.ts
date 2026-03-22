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

  async appendLongText(blockId: string, text: string): Promise<void> {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    
    const children = paragraphs.map(p => ({
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: p } }]
      }
    }));

    await this.client.callTool({
      name: 'API-patch-block-children',
      arguments: {
        block_id: blockId,
        children
      }
    });
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
