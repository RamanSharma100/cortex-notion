import { describe, test, expect } from '@jest/globals';
import { CommandParser } from '../commands/parser';

describe('CommandParser', () => {
  test('should parse "notion login" command', () => {
    const result = CommandParser.parse('notion login');
    expect(result.type).toBe('login');
  });

  test('should parse "ai login" command', () => {
    const result = CommandParser.parse('ai login');
    expect(result.type).toBe('ai-login');
  });

  test('should parse "idea:" command and trim value', () => {
    const result = CommandParser.parse('idea: AI fitness startup  ');
    expect(result.type).toBe('idea');
    expect(result.value).toBe('AI fitness startup');
  });

  test('should parse "build:" command', () => {
    const result = CommandParser.parse('build: Vertical Farming');
    expect(result.type).toBe('build');
    expect(result.value).toBe('Vertical Farming');
  });

  test('should parse "brainstorm:" command', () => {
    const result = CommandParser.parse('brainstorm: health topics');
    expect(result.type).toBe('brainstorm');
    expect(result.value).toBe('health topics');
  });

  test('should parse "tasks:" command', () => {
    const result = CommandParser.parse('tasks: my-app');
    expect(result.type).toBe('tasks');
    expect(result.value).toBe('my-app');
  });

  test('should parse "investor:" command', () => {
    const result = CommandParser.parse('investor: fitness app');
    expect(result.type).toBe('investor');
    expect(result.value).toBe('fitness app');
  });

  test('should return "unknown" for unrecognized commands', () => {
    const result = CommandParser.parse('random script');
    expect(result.type).toBe('unknown');
  });

  test('should handle empty or whitespace-only strings', () => {
    const result = CommandParser.parse('   ');
    expect(result.type).toBe('unknown');
  });
});
