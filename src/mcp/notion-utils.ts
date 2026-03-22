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
    const lines = text.split('\n');
    const children: any[] = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (!line) {
        i++;
        continue;
      }

      // TABLE DETECTION: contigous lines starting with |
      if (line.startsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const l = lines[i].trim();
          // Skip the divider line | --- | --- |
          if (!l.match(/^\|?\s*:?-+:?\s*\|/)) {
            tableLines.push(l);
          }
          i++;
        }

        if (tableLines.length > 0) {
          const rows = tableLines.map(tLine => {
            const cells = tLine.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            return {
              type: 'table_row',
              table_row: {
                cells: cells.map(cell => this.parseMarkdownRichText(cell.trim()))
              }
            };
          });

          children.push({
            type: 'table',
            table: {
              table_width: rows[0].table_row.cells.length,
              has_column_header: true,
              children: rows
            }
          });
        }
        continue;
      }

      // HEADER
      if (line.startsWith('#')) {
        const content = line.replace(/^#+\s*/, '');
        children.push({
          type: 'heading_3',
          heading_3: { rich_text: this.parseMarkdownRichText(content) }
        });
        i++;
        continue;
      }

      // BULLETS
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.replace(/^[-*]\s*/, '');
        children.push({
          type: 'bulleted_list_item',
          bulleted_list_item: { rich_text: this.parseMarkdownRichText(content) }
        });
        i++;
        continue;
      }

      // QUOTES
      if (line.startsWith('> ')) {
        const content = line.replace(/^>\s*/, '');
        children.push({
          type: 'quote',
          quote: { rich_text: this.parseMarkdownRichText(content) }
        });
        i++;
        continue;
      }

      // CALLOUTS
      if (line.startsWith('[!] ')) {
        const content = line.replace(/^\[!\]\s*/, '');
        children.push({
          type: 'callout',
          callout: {
            rich_text: this.parseMarkdownRichText(content),
            icon: { type: 'emoji', emoji: '💡' }
          }
        });
        i++;
        continue;
      }

      // DEFAULT PARAGRAPH
      children.push({
        type: 'paragraph',
        paragraph: { rich_text: this.parseMarkdownRichText(line) }
      });
      i++;
    }

    // Chunk children into groups of 100
    for (let j = 0; j < children.length; j += 100) {
      await this.client.callTool({
        name: 'API-patch-block-children',
        arguments: {
          block_id: blockId,
          children: children.slice(j, j + 100)
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
  async createDatabase(pageId: string, title: string): Promise<string> {
    const result = await this.client.callTool({
      name: 'API-post-database',
      arguments: {
        parent: { type: 'page_id', page_id: pageId },
        title: [{ type: 'text', text: { content: title } }],
        properties: {
          Name: { title: {} },
          Status: { select: { options: [
            { name: 'To Do', color: 'red' },
            { name: 'In Progress', color: 'blue' },
            { name: 'Done', color: 'green' }
          ]}},
          Priority: { select: { options: [
            { name: 'High', color: 'orange' },
            { name: 'Medium', color: 'yellow' },
            { name: 'Low', color: 'gray' }
          ]}},
          Deadline: { date: {} }
        }
      }
    });
    return this.extractId(result);
  }

  async createDatabasePage(databaseId: string, properties: any): Promise<string> {
    const result = await this.client.callTool({
      name: 'API-post-page',
      arguments: {
        parent: { database_id: databaseId },
        properties
      }
    });
    return this.extractId(result);
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

  async searchDatabases(query?: string): Promise<any[]> {
    const result = await this.client.callTool({
      name: 'API-post-search',
      arguments: {
        query: query || '',
        filter: { property: 'object', value: 'database' }
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
