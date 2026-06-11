/* Fake terminal easter egg — a small but genuinely playable shell:
   virtual filesystem, site navigation, neofetch, a code-breaker minigame,
   command history, tab-completion, and a couple of hidden surprises. */

import { toggleMatrix } from './matrix';

/* ---------- virtual filesystem ---------- */

interface FileNode {
  type: 'file';
  body: string;
}
interface DirNode {
  type: 'dir';
  children: Record<string, FSNode>;
}
type FSNode = FileNode | DirNode;

const f = (body: string): FileNode => ({ type: 'file', body });
const d = (children: Record<string, FSNode>): DirNode => ({ type: 'dir', children });

const FS: DirNode = d({
  'about.txt': f(
    `Xavier Ogay — cybersecurity engineer.
MSc Cyber Security (EPFL / ETH Zürich). I live below the abstraction layers:
binary analysis, systems security, and offensive tooling.
Currently: available for hire. Try \x1bopen cv\x1b or \x1bopen github\x1b.`
  ),
  'skills.txt': f(
    `languages : C/C++  Rust  Python  Java  Kotlin  Scala  x86/MIPS ASM  VHDL
lowlevel  : LLVM  WebAssembly  ELF internals  linkers/loaders
security  : binary analysis  side channels  EDR evasion  cryptography
ml        : PyTorch  data analysis
tooling   : Docker  Git  gdb  Ghidra`
  ),
  'contact.txt': f(
    `email    : xaga.ogay [at] gmail [dot] com
linkedin : linkedin.com/in/xavier-ogay
github   : github.com/2Tricky4u
Run \x1bopen linkedin\x1b or use the contact form on the site.`
  ),
  'resume.txt': f(`CV lives on Google Drive. Run \x1bopen cv\x1b to view/download it.`),
  '.secret': d({
    'flag.txt': f(
      `You found the hidden directory. Respect.
flag{w3lc0me_t0_th3_und3rgr0und}
Now go crack the access code — type \x1bcrack\x1b.`
    ),
  }),
  projects: d({
    'automutate.txt': f(
      `AutoMutate++  —  Master's thesis @ armasuisse / Cyber-Defence Campus (CYD)
Closed-loop EDR evaluation in Rust: multi-layer artifact mutation
(tree-sitter AST / LLVM IR / PE) + differential testing vs Defender, MDE, Cortex.
> open automutate`
    ),
    'symbolic-wasm.txt': f(
      `Symbolic LLVM Memory Sandboxing for WebAssembly  —  research project @ EPFL
Static analysis at the LLVM level that proves memory safety of WASM smart
contracts and only instruments what it cannot prove.
> open symbolic`
    ),
    'hardware-security.txt': f(
      `Hardware Security  —  ETH Zürich
End-to-end microarchitectural & DRAM attacks: AnC, Meltdown, RetBleed, Rowhammer.
> open hardware`
    ),
    'more.txt': f(`18 projects total. Browse them all with \x1bopen projects\x1b.`),
  }),
});

/* ---------- terminal ---------- */

const COMMANDS = [
  'help', 'ls', 'cd', 'pwd', 'cat', 'whoami', 'neofetch', 'skills', 'social',
  'open', 'echo', 'banner', 'coffee', 'cowsay', 'crack', 'rps', 'date',
  'history', 'clear', 'reboot', 'exit',
];

const OPEN_TARGETS: Record<string, string> = {
  github: 'https://github.com/2Tricky4u',
  linkedin: 'https://linkedin.com/in/xavier-ogay',
  cv: 'https://drive.google.com/file/d/1QvlzlDPrODCkBERG-GFwfc5eGkK12XTU/preview',
  email: 'mailto:xaga.ogay@gmail.com',
  projects: '/#projects',
  writeups: '/writeups',
  home: '/',
  contact: '/#contact',
  automutate: '/projects/automutate',
  symbolic: '/projects/symbolic-llvm-sandboxing',
  hardware: '/projects/hardware-security',
};

const BANNER = String.raw`
__  __    ___     _____ _____ ____
\ \/ /   / \ \   / /_ _| ____|  _ \
 \  /   / _ \ \ / / | ||  _| | |_) |
 /  \  / ___ \ V /  | || |___|  _ <
/_/\_\/_/   \_\_/  |___|_____|_| \_\ `;

const NEOFETCH_LOGO = [
  '       _.-^^---....,,--       ',
  '   _--                  --_   ',
  '  <          O W N         >  ',
  '   \\._                   _./   ',
  '      ```--. . , ; .--```      ',
  '            | |   |            ',
  '         .-=||  | |=-.         ',
  '         `-=#$%&%$#=-`         ',
  '            | ;  :|            ',
  '   _____.,-#%&$@%#&#~,._____   ',
];

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* In file bodies, \x1b...\x1b marks a clickable inline command hint. */
const renderBody = (s: string): string =>
  esc(s).replace(/\x1b([^\x1b]+)\x1b/g, '<span class="t-cyan">$1</span>');

class Terminal {
  private container: HTMLElement;
  private output: HTMLElement;
  private promptEl: HTMLElement;
  private input: HTMLInputElement;

  private cwd: string[] = []; // path segments from root
  private history: string[] = [];
  private histIdx = 0;
  private booted = false;
  private mode: ((line: string) => void) | null = null;
  private promptOverride: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.output = container.querySelector('.term-output')!;
    this.promptEl = container.querySelector('.term-prompt')!;
    this.input = container.querySelector('.term-input')!;
    this.refreshPrompt();

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submit();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autocomplete();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.recall(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.recall(1);
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        this.output.textContent = '';
      } else if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        this.exitMode();
        this.print('<span class="t-dim">^C</span>');
      }
    });

    container.addEventListener('mousedown', () => this.input.focus());
    container.querySelector('.term-close')?.addEventListener('click', () => this.hide());
    this.initDrag();
  }

  /* ----- visibility ----- */

  toggle(): void {
    this.container.hidden ? this.show() : this.hide();
  }

  show(): void {
    this.container.hidden = false;
    if (!this.booted) {
      this.boot();
      this.booted = true;
    }
    this.input.focus();
  }

  hide(): void {
    this.container.hidden = true;
  }

  get isOpen(): boolean {
    return !this.container.hidden;
  }

  private boot(): void {
    this.print(`<span class="t-red">${esc(BANNER)}</span>`);
    this.print(
      `<span class="t-dim">xavier@xavierogay.ch — interactive shell. Type </span><span class="t-cyan">help</span><span class="t-dim"> to begin.</span>`
    );
    this.print('');
  }

  /* ----- output ----- */

  private print(html = ''): void {
    const line = document.createElement('div');
    line.innerHTML = html;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  private promptStr(): string {
    if (this.promptOverride) return this.promptOverride;
    const path = this.cwd.length ? '~/' + this.cwd.join('/') : '~';
    return `xavier@xavierogay.ch:${path}$`;
  }

  private refreshPrompt(): void {
    this.promptEl.textContent = this.promptStr();
  }

  /* ----- input handling ----- */

  private submit(): void {
    const raw = this.input.value;
    this.input.value = '';
    this.print(`<span class="term-accent">${esc(this.promptStr())}</span> ${esc(raw)}`);

    if (this.mode) {
      this.mode(raw.trim());
      this.input.focus();
      return;
    }

    const trimmed = raw.trim();
    if (trimmed) {
      this.history.push(trimmed);
      this.histIdx = this.history.length;
      this.handle(trimmed);
    }
    this.input.focus();
  }

  private recall(dir: number): void {
    if (this.mode || !this.history.length) return;
    this.histIdx = Math.max(0, Math.min(this.history.length, this.histIdx + dir));
    this.input.value = this.history[this.histIdx] ?? '';
    // move caret to end
    requestAnimationFrame(() => {
      const n = this.input.value.length;
      this.input.setSelectionRange(n, n);
    });
  }

  /* ----- command dispatch ----- */

  private handle(command: string): void {
    const [cmd, ...args] = command.split(/\s+/);
    switch (cmd) {
      case 'help': return this.help();
      case 'ls': return this.ls(args[0]);
      case 'cd': return this.cd(args[0]);
      case 'pwd': return this.print('/' + this.cwd.join('/'));
      case 'cat': return this.cat(args[0]);
      case 'whoami':
        return this.print('xavier — cybersecurity engineer. (you, however, are a curious visitor.)');
      case 'neofetch': return this.neofetch();
      case 'skills': return this.cat('skills.txt', FS);
      case 'social': return this.social();
      case 'open': return this.open(args[0]);
      case 'echo': return this.print(esc(args.join(' ')));
      case 'banner': return this.print(`<span class="t-red">${esc(BANNER)}</span>`);
      case 'coffee': return this.coffee();
      case 'cowsay': return this.cowsay(args.join(' ') || 'mooo');
      case 'crack': return this.crackStart();
      case 'rps': return this.rps(args[0]);
      case 'date': return this.print(new Date().toString());
      case 'history':
        return this.print(this.history.map((h, i) => `<span class="t-dim">${i + 1}</span>  ${esc(h)}`).join('\n') || '<span class="t-dim">no history yet</span>');
      case 'clear':
        this.output.textContent = '';
        return;
      case 'reboot':
        this.output.textContent = '';
        this.cwd = [];
        this.refreshPrompt();
        this.print('<span class="t-dim">rebooting… done.</span>');
        return;
      case 'exit':
        return this.hide();
      // hidden commands
      case 'hack':
      case 'matrix': {
        const on = toggleMatrix();
        this.print(on ? '<span class="t-green">Wake up, Neo…</span>' : 'Goodbye.');
        if (on) this.hide();
        return;
      }
      case 'sudo':
        return this.print('<span class="t-red">Permission denied:</span> nice try. This incident will be reported. 🚓');
      case 'rm':
        if (args.join(' ').includes('-rf'))
          return this.print('<span class="t-yellow">whoa.</span> not on my watch.');
        return this.print(`rm: cannot remove '${esc(args[0] ?? '')}': read-only easter egg`);
      case '':
        return;
      default:
        return this.print(
          `<span class="t-red">command not found:</span> ${esc(cmd)}  <span class="t-dim">— type </span><span class="t-cyan">help</span>`
        );
    }
  }

  /* ----- filesystem helpers ----- */

  private resolveDir(): DirNode {
    let node: DirNode = FS;
    for (const seg of this.cwd) {
      const next = node.children[seg];
      if (next && next.type === 'dir') node = next;
    }
    return node;
  }

  private ls(arg?: string): void {
    const dir = this.resolveDir();
    const entries = Object.entries(dir.children);
    const showAll = arg === '-a';
    const names = entries
      .filter(([name]) => showAll || !name.startsWith('.'))
      .map(([name, node]) =>
        node.type === 'dir'
          ? `<span class="t-blue t-bold">${esc(name)}/</span>`
          : `<span class="${name.startsWith('.') ? 't-dim' : 't-cyan'}">${esc(name)}</span>`
      );
    this.print(names.join('   ') || '<span class="t-dim">(empty)</span>');
  }

  private cd(arg?: string): void {
    if (!arg || arg === '~' || arg === '/') {
      this.cwd = [];
      return this.refreshPrompt();
    }
    if (arg === '..') {
      this.cwd.pop();
      return this.refreshPrompt();
    }
    const dir = this.resolveDir();
    const target = dir.children[arg.replace(/\/$/, '')];
    if (!target) return this.print(`cd: no such file or directory: ${esc(arg)}`);
    if (target.type !== 'dir') return this.print(`cd: not a directory: ${esc(arg)}`);
    this.cwd.push(arg.replace(/\/$/, ''));
    this.refreshPrompt();
  }

  private cat(arg?: string, root?: DirNode): void {
    if (!arg) return this.print('usage: cat <file>');
    const dir = root ?? this.resolveDir();
    const node = dir.children[arg];
    if (!node) return this.print(`cat: ${esc(arg)}: no such file`);
    if (node.type === 'dir') return this.print(`cat: ${esc(arg)}: is a directory`);
    this.print(renderBody(node.body));
  }

  /* ----- rich commands ----- */

  private help(): void {
    const rows: [string, string][] = [
      ['files', 'ls  cd  pwd  cat'],
      ['about', 'whoami  neofetch  skills  social'],
      ['navigate', 'open &lt;github|linkedin|cv|projects|writeups|…&gt;'],
      ['fun', 'banner  coffee  cowsay  crack  rps'],
      ['system', 'echo  date  history  clear  reboot  exit'],
    ];
    this.print('<span class="t-dim">available commands — TAB completes, ↑/↓ history</span>');
    this.print('');
    for (const [k, v] of rows) {
      this.print(`  <span class="t-yellow">${k.padEnd(9)}</span> <span class="t-cyan">${v}</span>`);
    }
    this.print('');
    this.print('<span class="t-dim">psst… some commands are not on this list.</span>');
  }

  private neofetch(): void {
    const info: [string, string][] = [
      ['', 'xavier@xavierogay.ch'],
      ['', '--------------------'],
      ['role', 'Cybersecurity Engineer'],
      ['edu', 'MSc Cyber Security · EPFL / ETH Zürich'],
      ['os', 'Arch Linux (yes, btw)'],
      ['shell', 'xsh 5.0'],
      ['editor', 'nvim'],
      ['langs', 'C · Rust · Python · ASM'],
      ['focus', 'binary analysis · systems sec'],
      ['status', 'available for hire'],
      ['uptime', '~26 years'],
    ];
    const lines = Math.max(NEOFETCH_LOGO.length, info.length);
    for (let i = 0; i < lines; i++) {
      const logo = (NEOFETCH_LOGO[i] ?? '').padEnd(31);
      const pair = info[i];
      let right = '';
      if (pair) {
        right = pair[0]
          ? `<span class="t-red t-bold">${pair[0]}</span><span class="t-dim">:</span> ${esc(pair[1])}`
          : `<span class="t-cyan t-bold">${esc(pair[1])}</span>`;
      }
      this.print(`<span class="t-magenta">${esc(logo)}</span>${right}`);
    }
  }

  private social(): void {
    this.print('<a href="https://github.com/2Tricky4u" target="_blank" rel="noopener">→ github.com/2Tricky4u</a>');
    this.print('<a href="https://linkedin.com/in/xavier-ogay" target="_blank" rel="noopener">→ linkedin.com/in/xavier-ogay</a>');
    this.print('<a href="https://people.epfl.ch/xavier.ogay" target="_blank" rel="noopener">→ EPFL profile</a>');
  }

  private open(target?: string): void {
    if (!target) {
      this.print('usage: open &lt;target&gt;');
      this.print('<span class="t-dim">targets: ' + Object.keys(OPEN_TARGETS).join(', ') + '</span>');
      return;
    }
    const url = OPEN_TARGETS[target];
    if (!url) return this.print(`open: unknown target '${esc(target)}'`);
    if (url.startsWith('http') || url.startsWith('mailto')) {
      window.open(url, '_blank', 'noopener');
      this.print(`<span class="t-green">opening</span> ${esc(target)} <span class="t-dim">in a new tab…</span>`);
    } else {
      this.print(`<span class="t-green">navigating</span> → ${esc(url)}`);
      this.hide();
      window.location.assign(url);
    }
  }

  private coffee(): void {
    this.print(
      `<span class="t-yellow">${esc(
        [
          '      ( (',
          '       ) )',
          '    ........',
          '    |      |]',
          '    \\      /',
          "     `----'",
        ].join('\n')
      )}</span>`
    );
    this.print('<span class="t-dim">brewing… ERR: coffee.service not found. (PRs welcome)</span>');
  }

  private cowsay(msg: string): void {
    const text = msg.slice(0, 40);
    const top = ' ' + '_'.repeat(text.length + 2);
    const bottom = ' ' + '-'.repeat(text.length + 2);
    const cow = [
      '        \\   ^__^',
      '         \\  (oo)\\_______',
      '            (__)\\       )\\/\\',
      '                ||----w |',
      '                ||     ||',
    ].join('\n');
    this.print(`<span class="t-cyan">${esc(top)}\n&lt; ${esc(text)} &gt;\n${esc(bottom)}\n${esc(cow)}</span>`);
  }

  /* ----- minigame: crack the access code (bulls & cows) ----- */

  private secret = '';
  private attempts = 0;

  private crackStart(): void {
    // 4 unique digits
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j]!, digits[i]!];
    }
    this.secret = digits.slice(0, 4).join('');
    this.attempts = 0;
    this.mode = (line) => this.crackGuess(line);
    this.promptOverride = 'crack>';
    this.refreshPrompt();
    this.print('<span class="t-green t-bold">⛓  ACCESS CODE BREAKER</span>');
    this.print('<span class="t-dim">Guess the 4-digit code (unique digits). Feedback per guess:</span>');
    this.print('<span class="t-dim">  </span><span class="t-green">●</span> = right digit, right spot   <span class="t-yellow">○</span> = right digit, wrong spot');
    this.print('<span class="t-dim">Type </span><span class="t-cyan">q</span><span class="t-dim"> to abort.</span>');
  }

  private crackGuess(line: string): void {
    if (line === 'q' || line === 'quit' || line === 'exit') {
      this.print(`<span class="t-dim">aborted. the code was </span><span class="t-yellow">${this.secret}</span>`);
      return this.exitMode();
    }
    if (!/^\d{4}$/.test(line) || new Set(line).size !== 4) {
      return this.print('<span class="t-red">×</span> <span class="t-dim">enter 4 unique digits, e.g. 0427</span>');
    }
    this.attempts++;
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
      if (line[i] === this.secret[i]) bulls++;
      else if (this.secret.includes(line[i]!)) cows++;
    }
    if (bulls === 4) {
      this.print(
        `<span class="t-green t-bold">✔ ACCESS GRANTED</span> <span class="t-dim">— cracked in ${this.attempts} ${this.attempts === 1 ? 'try' : 'tries'}.</span>`
      );
      this.print('<span class="t-magenta">flag{c0d3_br34k3r_5upr3m3}</span>');
      return this.exitMode();
    }
    const marks = '<span class="t-green">●</span>'.repeat(bulls) + '<span class="t-yellow">○</span>'.repeat(cows) + '<span class="t-dim">·</span>'.repeat(4 - bulls - cows);
    this.print(`  ${esc(line)}   ${marks}   <span class="t-dim">(${this.attempts})</span>`);
  }

  private rps(choice?: string): void {
    const opts = ['rock', 'paper', 'scissors'];
    if (!choice || !opts.includes(choice)) {
      return this.print('usage: rps &lt;rock|paper|scissors&gt;');
    }
    const cpu = opts[Math.floor(Math.random() * 3)]!;
    const beats: Record<string, string> = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
    let result: string;
    if (cpu === choice) result = '<span class="t-yellow">draw.</span>';
    else if (beats[choice] === cpu) result = '<span class="t-green">you win!</span>';
    else result = '<span class="t-red">you lose.</span>';
    this.print(`you: ${esc(choice)}   cpu: ${esc(cpu)}   ${result}`);
  }

  private exitMode(): void {
    this.mode = null;
    this.promptOverride = null;
    this.refreshPrompt();
  }

  /* ----- tab completion ----- */

  private autocomplete(): void {
    if (this.mode) return;
    const value = this.input.value;
    const parts = value.split(/\s+/);
    if (parts.length <= 1) {
      this.completeFrom(value, COMMANDS, '');
      return;
    }
    const cmd = parts[0];
    const partial = parts[parts.length - 1] ?? '';
    const prefix = parts.slice(0, -1).join(' ') + ' ';
    if (cmd === 'open') {
      this.completeFrom(partial, Object.keys(OPEN_TARGETS), prefix);
    } else if (cmd === 'cd' || cmd === 'cat' || cmd === 'ls') {
      const names = Object.keys(this.resolveDir().children);
      this.completeFrom(partial, names, prefix);
    }
  }

  private completeFrom(partial: string, pool: string[], prefix: string): void {
    const matches = pool.filter((c) => c.startsWith(partial));
    if (matches.length === 1) {
      this.input.value = prefix + matches[0] + ' ';
    } else if (matches.length > 1) {
      this.print(`<span class="t-dim">${matches.map(esc).join('   ')}</span>`);
    }
  }

  /* ----- drag ----- */

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
      bar.addEventListener('pointerup', () => bar.removeEventListener('pointermove', onMove), {
        once: true,
      });
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
