export class CommandParser {
  static parse = (input: string) => {
    const trimmed = input.trim();

    if (trimmed === 'notion login') {
      return { type: 'login' };
    }

    if (trimmed === 'ai login') {
      return { type: 'ai-login' };
    }

    if (trimmed.startsWith('idea:')) {
      return { type: 'idea', value: trimmed.replace('idea:', '').trim() };
    }

    if (trimmed.startsWith('build:')) {
      return { type: 'build', value: trimmed.replace('build:', '').trim() };
    }

    if (trimmed.startsWith('brainstorm:')) {
      return { type: 'brainstorm', value: trimmed.replace('brainstorm:', '').trim() };
    }

    if (trimmed.startsWith('tasks:')) {
      return { type: 'tasks', value: trimmed.replace('tasks:', '').trim() };
    }

    if (trimmed.startsWith('investor:')) {
      return { type: 'investor', value: trimmed.replace('investor:', '').trim() };
    }

    if (trimmed.startsWith('research:')) {
      return {
        type: 'research',
        value: trimmed.replace('research:', '').trim(),
      };
    }

    if (trimmed.startsWith('plan:')) {
      return { type: 'plan', value: trimmed.replace('plan:', '').trim() };
    }

    if (trimmed === 'status') {
      return { type: 'status', value: '' };
    }

    return { type: 'unknown', value: trimmed };
  };
}
