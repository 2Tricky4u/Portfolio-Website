"use strict";

/**
 * Configurations
 */
var configs = (function () {
  var instance;
  var Singleton = function (options) {
    options = options || Singleton.defaultOptions;
    for (var key in Singleton.defaultOptions) {
      this[key] = options[key] || Singleton.defaultOptions[key];
    }
  };
  Singleton.defaultOptions = {
    general_help: "Below there's a list of commands that you can use.\nPress TAB for autocomplete.",
    ls_help: "List all available files.",
    cat_help: "View file content.",
    whoami_help: "Print user details.",
    date_help: "Show the current date and time.",
    help_help: "Show this help menu.",
    clear_help: "Clear the terminal screen.",
    reboot_help: "Reboot the terminal.",
    invalid_command_message: "Command not found: <value>",
    reboot_message: "Rebooting...\n\n3...\n\n2...\n\n1...\n\nDone!",
    permission_denied_message: "Permission denied: '<value>'",
    usage: "Usage",
    file: "file",
    file_not_found: "File '<value>' not found.",
    user: "b34u71ful_u53r",
    host: "skynet",
    is_root: false,
    type_delay: 20
  };
  return {
    getInstance: function (options) {
      instance === void 0 && (instance = new Singleton(options));
      return instance;
    }
  };
})();

/**
 * Files in the fake terminal
 */
var files = (function () {
  var instance;
  var Singleton = function (options) {
    options = options || Singleton.defaultOptions;
    for (var key in Singleton.defaultOptions) {
      this[key] = options[key] || Singleton.defaultOptions[key];
    }
  };
  Singleton.defaultOptions = {
    "about.txt": "This website was built by Xavier Ogay.\nFeel free to explore!",
    "contact.txt": "Contact at bottom of the page",
    "projects.txt": "Check out my projects in the portfolio section.",
    "blog.txt": "This is where the interesting things are!",
    "resume.txt": "CV available at bottom page."
  };
  return {
    getInstance: function (options) {
      instance === void 0 && (instance = new Singleton(options));
      return instance;
    }
  };
})();

/**
 * Terminal Logic
 */
var main = (function () {
  var Terminal = function (prompt, cmdLine, output, user, host, root, outputTimer) {
    this.prompt = prompt;
    this.cmdLine = cmdLine;
    this.output = output;
    this.user = user;
    this.host = host;
    this.root = root;
    this.completePrompt = `${user}@${host}:~${root ? "#" : "$"}`;
    this.typeSimulator = new TypeSimulator(outputTimer, output);
  };

  Terminal.prototype.type = function (text, callback) {
    this.typeSimulator.type(text, callback);
  };

  Terminal.prototype.exec = function () {
    var command = this.cmdLine.value.trim();
    this.cmdLine.value = "";
    this.prompt.textContent = "";
    this.output.innerHTML += `<span class="prompt-color">${this.completePrompt}</span> ${command}<br/>`;
    this.handleCmd(command);
  };

  Terminal.prototype.init = function () {
    this.cmdLine.disabled = false;
    this.prompt.textContent = this.completePrompt;
    this.cmdLine.focus();

    // When clicking inside CMD, focus the input
    document.querySelector(".cmd-container").addEventListener("click", () => {
      this.cmdLine.focus();
      document.body.classList.add("hide-cursor"); // Prevent cursor outside
    });

    // When clicking outside, blur the input and hide the cursor
    document.addEventListener("click", (event) => {
      if (!document.querySelector(".cmd-container").contains(event.target)) {
        this.cmdLine.blur();
        document.body.classList.remove("hide-cursor"); // Restore default cursor
      }
    });

    this.cmdLine.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.exec();
        event.preventDefault();
      } else if (event.key === "Tab") {
        event.preventDefault();
        this.handleAutocomplete();
      }
    });
  };


  Terminal.prototype.handleCmd = function (command) {
    var cmdComponents = command.split(" ");
    switch (cmdComponents[0]) {
      case "cat":
        this.cat(cmdComponents);
        break;
      case "ls":
        this.ls();
        break;
      case "whoami":
        this.whoami();
        break;
      case "date":
        this.date();
        break;
      case "help":
        this.help();
        break;
      case "clear":
        this.clear();
        break;
      case "reboot":
        this.reboot();
        break;
      default:
        this.invalidCommand(cmdComponents);
        break;
    }
  };

  Terminal.prototype.cat = function (cmdComponents) {
    if (cmdComponents.length <= 1) {
      this.type("Usage: cat <filename>", this.unlock.bind(this));
      return;
    }
    var filename = cmdComponents[1];
    var fileContents = files.getInstance()[filename];
    if (!fileContents) {
      this.type(`Error: File '${filename}' not found.`, this.unlock.bind(this));
    } else {
      this.type(fileContents, this.unlock.bind(this));
    }
  };

  Terminal.prototype.ls = function () {
    this.type(Object.keys(files.getInstance()).join("\n"), this.unlock.bind(this));
  };

  Terminal.prototype.whoami = function () {
    this.type(`User: ${this.user}\nHost: ${this.host}`, this.unlock.bind(this));
  };

  Terminal.prototype.date = function () {
    this.type(new Date().toString(), this.unlock.bind(this));
  };

  Terminal.prototype.help = function () {
    this.type(configs.getInstance().general_help, this.unlock.bind(this));
  };

  Terminal.prototype.clear = function () {
    this.output.innerHTML = "";
    this.unlock();
  };

  Terminal.prototype.reboot = function () {
    this.type(configs.getInstance().reboot_message, this.reset.bind(this));
  };

  Terminal.prototype.invalidCommand = function (cmdComponents) {
    this.type(`Command not found: ${cmdComponents[0]}`, this.unlock.bind(this));
  };

  Terminal.prototype.unlock = function () {
    this.prompt.textContent = this.completePrompt;
    this.cmdLine.disabled = false;
    this.cmdLine.focus();
  };

  Terminal.prototype.reset = function () {
    this.output.innerHTML = "";
    this.unlock();
  };

  Terminal.prototype.handleAutocomplete = function () {
    var input = this.cmdLine.value.trim();
    var possibleCommands = ["ls", "cat", "whoami", "date", "help", "clear", "reboot"];
    var matches = possibleCommands.filter(cmd => cmd.startsWith(input));
    if (matches.length === 1) {
      this.cmdLine.value = matches[0] + " ";
    } else if (matches.length > 1) {
      this.type(matches.join("\n"), () => this.unlock());
    }
  };

  var TypeSimulator = function (timer, output) {
    this.timer = timer;
    this.output = output;
  };

  TypeSimulator.prototype.type = function (text, callback) {
    let i = 0;
    const output = this.output;
    const timer = this.timer;
    (function typer() {
      if (i < text.length) {
        output.innerHTML += text.charAt(i);
        i++;
        setTimeout(typer, timer);
      } else if (callback) {
        output.innerHTML += "<br/>";
        callback();
      }
    })();
  };

  return {
    listener: function () {
      new Terminal(
        document.getElementById("prompt"),
        document.getElementById("cmdline"),
        document.getElementById("output"),
        configs.getInstance().user,
        configs.getInstance().host,
        configs.getInstance().is_root,
        configs.getInstance().type_delay
      ).init();
    }
  };
})();

window.onload = main.listener;
