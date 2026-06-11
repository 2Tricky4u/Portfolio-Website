/* Fake terminal easter egg — port of the legacy js/main.js singleton,
   restyled and toggled via the nav `>_` button or Ctrl+`. */

import { toggleMatrix } from './matrix';

const FILES: Record<string, string> = {
  'about.txt': 'This website was built by Xavier Ogay.\nFeel free to explore!',
  'contact.txt': 'Contact section at the bottom of the page.',
  'projects.txt': 'Check out the featured projects and the archive on the homepage.',
  'writeups.txt': 'This is where the interesting things are! See /writeups.',
  'resume.txt': 'CV available in the contact section.',
};

const COMMANDS = ['ls', 'cat', 'whoami', 'date', 'help', 'clear', 'reboot', 'exit'];

const HELP = `Below is a list of commands you can use.
Press TAB for autocomplete.

ls      List all available files.
cat     View file content.
whoami  Print user details.
date    Show the current date and time.
help    Show this help menu.
clear   Clear the terminal screen.
reboot  Reboot the terminal.
exit    Close the terminal.`;

const TYPE_DELAY = 12;

class Terminal {
  private container: HTMLElement;
  private output: HTMLElement;
  private promptEl: HTMLElement;
  private input: HTMLInputElement;
  private prompt = 'xavier@xavierogay.ch:~$';

  constructor(container: HTMLElement) {
    this.container = container;
    this.output = container.querySelector('.term-output')!;
    this.promptEl = container.querySelector('.term-prompt')!;
    this.input = container.querySelector('.term-input')!;
    this.promptEl.textContent = this.prompt;

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.exec();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autocomplete();
      }
    });

    container.addEventListener('mousedown', () => this.input.focus());
    container.querySelector('.term-close')?.addEventListener('click', () => this.hide());
    this.initDrag();
  }

  toggle(): void {
    this.container.hidden ? this.show() : this.hide();
  }

  show(): void {
    this.container.hidden = false;
    this.input.focus();
  }

  hide(): void {
    this.container.hidden = true;
  }

  get isOpen(): boolean {
    return !this.container.hidden;
  }

  private exec(): void {
    const command = this.input.value.trim();
    this.input.value = '';
    this.promptEl.textContent = '';
    const line = document.createElement('div');
    const promptSpan = document.createElement('span');
    promptSpan.className = 'term-accent';
    promptSpan.textContent = this.prompt;
    line.append(promptSpan, ` ${command}`);
    this.output.appendChild(line);
    this.handle(command);
  }

  private handle(command: string): void {
    const [cmd, ...args] = command.split(' ');
    switch (cmd) {
      case '':
        this.unlock();
        break;
      case 'ls':
        this.type(Object.keys(FILES).join('\n'));
        break;
      case 'cat':
        this.cat(args[0]);
        break;
      case 'whoami':
        this.type('User: xavier\nHost: xavierogay.ch\nRole: cybersecurity engineer');
        break;
      case 'date':
        this.type(new Date().toString());
        break;
      case 'help':
        this.type(HELP);
        break;
      case 'clear':
        this.output.textContent = '';
        this.unlock();
        break;
      case 'reboot':
        this.type('Rebooting...\n\n3...\n2...\n1...\n\nDone!', () => {
          this.output.textContent = '';
          this.unlock();
        });
        break;
      case 'exit':
        this.unlock();
        this.hide();
        break;
      case 'hack': {
        const on = toggleMatrix();
        this.type(on ? 'Wake up, Neo...' : 'Goodbye.');
        if (on) this.hide();
        break;
      }
      case 'sudo':
        this.type('Permission denied: nice try.');
        break;
      default:
        this.type(`Command not found: ${cmd}\nType 'help' for available commands.`);
        break;
    }
  }

  private cat(filename?: string): void {
    if (!filename) {
      this.type('Usage: cat <filename>');
      return;
    }
    const contents = FILES[filename];
    this.type(contents ?? `Error: File '${filename}' not found.`);
  }

  private type(text: string, callback?: () => void): void {
    const done = callback ?? (() => this.unlock());
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.output.appendChild(document.createTextNode(text + '\n'));
      done();
      return;
    }
    let i = 0;
    const node = document.createTextNode('');
    this.output.appendChild(node);
    const typer = () => {
      if (i < text.length) {
        node.textContent += text.charAt(i);
        i++;
        this.output.scrollTop = this.output.scrollHeight;
        setTimeout(typer, TYPE_DELAY);
      } else {
        node.textContent += '\n';
        done();
      }
    };
    typer();
  }

  private unlock(): void {
    this.promptEl.textContent = this.prompt;
    this.input.focus();
    this.output.scrollTop = this.output.scrollHeight;
  }

  private autocomplete(): void {
    const value = this.input.value.trimStart();
    if (value.startsWith('cat ')) {
      const partial = value.slice(4);
      const matches = Object.keys(FILES).filter((f) => f.startsWith(partial));
      if (matches.length === 1) this.input.value = `cat ${matches[0]}`;
      else if (matches.length > 1) this.type(matches.join('\n'));
      return;
    }
    const matches = COMMANDS.filter((c) => c.startsWith(value));
    if (matches.length === 1) this.input.value = matches[0] + ' ';
    else if (matches.length > 1) this.type(matches.join('\n'));
  }

  private initDrag(): void {
    const bar = this.container.querySelector<HTMLElement>('.term-bar');
    if (!bar) return;
    let startX = 0;
    let startY = 0;
    let origX = 0;
    let origY = 0;

    const onMove = (e: PointerEvent) => {
      this.container.style.left = `${origX + e.clientX - startX}px`;
      this.container.style.top = `${origY + e.clientY - startY}px`;
      this.container.style.transform = 'none';
    };

    bar.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('.term-close')) return;
      const rect = this.container.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origX = rect.left;
      origY = rect.top;
      bar.setPointerCapture(e.pointerId);
      bar.addEventListener('pointermove', onMove);
      bar.addEventListener(
        'pointerup',
        () => bar.removeEventListener('pointermove', onMove),
        { once: true }
      );
    });
  }
}

const container = document.getElementById('terminal');
if (container) {
  const term = new Terminal(container);
  document.getElementById('terminal-trigger')?.addEventListener('click', () => term.toggle());
  document.addEventListener('keydown', (e) => {
    if (e.key === '`' && e.ctrlKey) {
      e.preventDefault();
      term.toggle();
    } else if (e.key === 'Escape' && term.isOpen) {
      term.hide();
    }
  });
}
