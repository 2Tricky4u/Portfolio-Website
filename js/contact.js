var tabLinks = document.getElementsByClassName("tab-links");
var tabContents = document.getElementsByClassName("tab-contents");

function opentab(name) {
  for (tabLink of tabLinks) {
    tabLink.classList.remove("active-link");
  }
  for (tabContent of tabContents) {
    tabContent.classList.remove("active-tab");
  }
  event.currentTarget.classList.add("active-link");
  document.getElementById(name).classList.add("active-tab");
  //tabContents.namedItem("tab-contents courses").classList.remove("active-tab");
}

var courses = document.getElementsByClassName("tab-contents courses");
var classes = false;

function showClasses() {
  if (!classes) {
    courses.item(0).classList.add("active-tab");
    document.getElementById("courses_btn").innerHTML = "Hide taken Courses";
    classes = true;
  } else {
    courses.item(0).classList.remove("active-tab");
    document.getElementById("courses_btn").innerHTML = "Show taken Courses";
    classes = false;
  }

}

var sideMenu = document.getElementById("sidemenu");

function openmenu() {
  sideMenu.style.right = "0";
}

function closemenu() {
  sideMenu.style.right = "-200px";
}

const scriptURL = 'https://script.google.com/macros/s/AKfycbwtaKGUTL0FXl7m_hIMPhFAj_RnJ0k5Yb2qR84FIUBE4sIkvsGvYAyLXkO2MvZNtiTe/exec'
const form = document.forms['submit-to-google-sheet']
const msg = document.getElementById("msg")
form.addEventListener('submit', e => {
  e.preventDefault()
  fetch(scriptURL, {method: 'POST', body: new FormData(form)})
    .then(response => {
      msg.innerHTML = "Message sent!"
      setTimeout(function () {
        msg.innerHTML = ""
      }, 10000)
      form.reset()
    })
    .catch(error => {
      msg.innerHTML = "Error!"
      setTimeout(function () {
        msg.innerHTML = ""
      }, 10000)
    })
})

const cv = document.getElementById("CV")
const txt = document.getElementById("cv_btn")
let show = false

function openCV() {
  if (!show) {
    cv.innerHTML = "<iframe src='https://drive.google.com/file/d/1-MBTczhQMnlvzgFF6v_-YOQwThhLJwo1/preview#toolbar=0' height='510' width='50%'/>"
    show = true
    txt.innerHTML = "Hide CV"
  } else {
    cv.innerHTML = ""
    show = false
    txt.innerHTML = "Show CV"
  }
}

function downloadCV() {
  const cvUrl = "https://drive.google.com/uc?export=download&id=1-MBTczhQMnlvzgFF6v_-YOQwThhLJwo1";

  const link = document.createElement("a"); // Create a temporary link element
  link.href = cvUrl;
  link.download = "Xavier_Ogay_CV.pdf"; // Suggested file name
  document.body.appendChild(link); // Append to document
  link.click(); // Trigger download
  document.body.removeChild(link); // Clean up
}

var canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  canvas2 = document.getElementById('canvas2'),
  ctx2 = canvas2.getContext('2d'),
  // full screen dimensions
  cw = window.innerWidth,
  ch = window.innerHeight,
  charArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  maxCharCount = 100,
  fallingCharArr = [],
  fontSize = 10,
  maxColums = cw / (fontSize);
canvas.width = canvas2.width = cw;
canvas.height = canvas2.height = ch;

var hac = false;
var audio = new Audio('doc/2.mp3');
var audio1 = new Audio('doc/ander.mp3');
var audio2 = new Audio('doc/bye.mp3');
var phone = document.getElementsByClassName("phone");

function hack() {
  hac = !hac;
  if (hac) {
    audio1.play();
    audio.play();
    audio2.pause();
    audio2.currentTime = 0;
    audio.volume = 0.2;
    audio1.volume = 0.6;
    audio2.volume = 1;
    hack1();
    phone.item(0).classList.add("hid");
  }
  if (!hac) {
    audio1.pause();
    audio1.currentTime = 0;
    audio.pause();
    audio2.play();
    ctx.reset();
    ctx2.reset();
    phone.item(0).classList.remove("hid");
    audio.remove();
    audio = new Audio("doc/" + (randomInt(1, 4) % 4).toString() + ".mp3")
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function hack1() {
  Point.prototype.draw = function (ctx) {

    this.value = charArr[randomInt(0, charArr.length - 1)].toUpperCase();
    this.speed = randomFloat(1, 5);


    ctx2.fillStyle = "rgba(255,255,255,0.8)";
    ctx2.font = fontSize + "px san-serif";
    ctx2.fillText(this.value, this.x, this.y);

    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px san-serif";
    ctx.fillText(this.value, this.x, this.y);


    this.y += this.speed;
    if (this.y > ch) {
      this.y = randomFloat(-100, 0);
      this.speed = randomFloat(2, 5);
    }
  }

  for (var i = 0; i < maxColums; i++) {
    fallingCharArr.push(new Point(i * fontSize, randomFloat(-500, 0)));
  }


  var update = function () {
    if (hac) {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, cw, ch);

      ctx2.clearRect(0, 0, cw, ch);

      var i = fallingCharArr.length;

      while (i--) {
        fallingCharArr[i].draw(ctx);
        var v = fallingCharArr[i];
      }

      requestAnimationFrame(update);
    }
  }
  update();
}
