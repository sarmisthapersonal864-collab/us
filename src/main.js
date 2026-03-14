import "./style.css";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(CustomEase, SplitText, ScrollTrigger);

CustomEase.create("hop", "0.85,0,0.15,1");

document.addEventListener("DOMContentLoaded", () => {

    /* ---------------- SMOOTH SCROLL ---------------- */

    const lenis = new Lenis();

    lenis.stop(); // disable scroll until hero finishes

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    /* ---------------- COUNTER ---------------- */

    const counterProgress = document.querySelector(".counter h1");
    const counter = { value: 0 };

    const counterTl = gsap.timeline();

    counterTl.to(counter, {
        value: 100,
        duration: 5,
        ease: "power2.out",
        onUpdate: () => {
            if (counterProgress) {
                counterProgress.textContent = Math.floor(counter.value);
            }
        },
        onComplete: () => {
            lenis.start();
            revealTl.play();
        }
    });

    /* ---------------- HERO TEXT SPLIT ---------------- */

    SplitText.create(".hero-header h1", {
        type: "words",
        mask: "words",
        wordClass: "word"
    });

    /* ---------------- HERO TIMELINES ---------------- */

    const overlayTextTl = gsap.timeline({ delay: 0.5 });
    const imageTl = gsap.timeline({ delay: 1 });
    const revealTl = gsap.timeline({ paused: true });

    /* ---------------- OVERLAY TEXT ---------------- */

    overlayTextTl
        .to(".overlay-text", { y: "0", duration: 0.75, ease: "hop" })
        .to(".overlay-text", { y: "-2rem", duration: 0.75, ease: "hop", delay: 0.75 })
        .to(".overlay-text", { y: "-4rem", duration: 0.75, ease: "hop", delay: 0.75 })
        .to(".overlay-text", { y: "-6rem", duration: 0.75, ease: "hop", delay: 1 });

    /* ---------------- HERO IMAGES ---------------- */

    imageTl
        .to(".hero-img-box", {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.05,
            duration: 1,
            ease: "hop"
        })
        .to(".hero-images", {
            gap: "0.75vw",
            duration: 1,
            ease: "hop"
        });

    /* ---------------- HERO REVEAL ---------------- */

    revealTl
        .to(".hero-img-box:not(.hero-img)", {
            opacity: 0,
            scale: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power2.inOut"
        })
        .to(".hero-img", {
            scale: 2,
            duration: 1,
            ease: "hop"
        }, "<")
        .to(".hero-overlay", {
            clipPath: "polygon(0% 0%,100% 0%,100% 0%,0% 0%)",
            duration: 1,
            ease: "hop"
        })
        .to(".hero-header h1 .word", {
            y: "0",
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out"
        }, "-=0.5");

    /* ---------------- SPOTLIGHT ANIMATION ---------------- */

    initSpotlightAnimations();
    window.addEventListener("resize", initSpotlightAnimations);

    function initSpotlightAnimations() {

        const images = document.querySelectorAll(".spot-img");
        const coverImg = document.querySelector(".spotlight-cover-img");

        if (!images.length || !coverImg) return;

        const scatterDirections = [
            { x: 1.3, y: 0.7 }, { x: -1.5, y: 1.0 }, { x: 1.1, y: -1.3 },
            { x: -1.7, y: -0.8 }, { x: 0.8, y: 1.5 }, { x: -1.0, y: -1.4 },
            { x: 1.6, y: 0.3 }, { x: -0.7, y: 1.7 }, { x: 1.2, y: -1.6 },
            { x: -1.4, y: 0.9 }, { x: 1.8, y: -0.5 }, { x: 1.1, y: -1.8 },

            { x: 0.9, y: 1.8 }, { x: -1.9, y: 0.4 }, { x: 1.0, y: -1.9 },
            { x: -0.8, y: 1.9 }, { x: 1.7, y: -1.0 }, { x: -1.3, y: 1.2 },
            { x: 0.7, y: 2.0 }, { x: 1.25, y: -0.2 },

            { x: -2.1, y: -0.6 }, { x: 2.2, y: 1.1 },
            { x: -0.4, y: -2.2 }, { x: 2.0, y: -1.5 },
            { x: -2.3, y: 0.8 }, { x: 0.5, y: 2.3 },
            { x: -1.6, y: -2.0 }, { x: 2.4, y: 0.2 },
            { x: -2.5, y: 1.3 },
            { x: 2.6, y: -0.9 },
            { x: -1.2, y: 2.4 },
            { x: 1.9, y: 2.1 },
            { x: -2.7, y: -1.4 }

        ];


        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const startPositions = Array.from(images).map(() => ({
            x: 0,
            y: 0,
            z: -1000,
            scale: 0
        }));

        const endPositions = scatterDirections.map(dir => ({
            x: dir.x * screenWidth * 0.5,
            y: dir.y * screenHeight * 0.5,
            z: 2000,
            scale: 1
        }));

        images.forEach((img, index) => {
            gsap.set(img, startPositions[index]);
        });

        gsap.set(coverImg, {
            z: 1000,
            scale: 0
        });

        ScrollTrigger.create({
            trigger: ".spotlight",
            start: "top top",
            end: `+=${window.innerHeight * 15}`,
            pin: true,
            scrub: 1,

            onUpdate: (self) => {

                const progress = self.progress;

                images.forEach((img, index) => {

                    let imageProgress = Math.max(0, (progress - index * 0.03) * 4);

                    const start = startPositions[index];
                    const end = endPositions[index];

                    gsap.set(img, {
                        z: gsap.utils.interpolate(start.z, end.z, imageProgress),
                        scale: gsap.utils.interpolate(start.scale, end.scale, imageProgress),
                        x: gsap.utils.interpolate(start.x, end.x, imageProgress),
                        y: gsap.utils.interpolate(start.y, end.y, imageProgress)
                    });

                });

            }
        });

    }

    /* ---------------- TEXT SCROLL SECTION ---------------- */

    gsap.to(".fleftlm", {
        scrollTrigger: {
            trigger: "#fimg",
            pin: true,
            start: "top top",
            end: "+=6000",
            scrub: 1
        },
        y: "-300%",
        ease: "power1.inOut"
    });

    /* ---------------- IMAGE CHANGE ON SCROLL ---------------- */

    const sections = document.querySelectorAll(".fleftlm");
    const images = document.querySelectorAll(".images img");

    sections.forEach((section, index) => {

        ScrollTrigger.create({

            trigger: section,
            start: "top center",
            end: "bottom center",

            onEnter: () => {
                gsap.to(images, { opacity: 0, duration: 0.3 });
                if (images[index]) {
                    gsap.to(images[index], { opacity: 1, duration: 0.3 });
                }
            },

            onEnterBack: () => {
                gsap.to(images, { opacity: 0, duration: 0.3 });
                if (images[index]) {
                    gsap.to(images[index], { opacity: 1, duration: 0.3 });
                }
            }

        });

    });

});
const isTouch = window.matchMedia("(hover:none)").matches;

if(!isTouch){

// cursor code here

}
const cursor = document.querySelector(".cursor-heart");
const trailContainer = document.querySelector(".heart-trail-container");

let mouseX = 0;
let mouseY = 0;

let posX = 0;
let posY = 0;

/* mouse position */

document.addEventListener("mousemove",(e)=>{
  mouseX = e.clientX;
  mouseY = e.clientY;

  createTrail(e.clientX,e.clientY);
});

/* smooth cursor */

function animate(){

  posX += (mouseX - posX) * 0.15;
  posY += (mouseY - posY) * 0.15;

  cursor.style.left = posX + "px";
  cursor.style.top = posY + "px";

  requestAnimationFrame(animate);
}

animate();

/* trail hearts */

function createTrail(x,y){

  const trail = document.createElement("div");
  trail.classList.add("trail-heart");

  trail.style.left = x+"px";
  trail.style.top = y+"px";

  trailContainer.appendChild(trail);

  setTimeout(()=>{
    trail.remove();
  },1000);

};

const lines = document.querySelectorAll(".story-text span");

const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){

      lines.forEach((line,index)=>{
        setTimeout(()=>{
          line.classList.add("show");
        }, index * 600);
      });

    }
  });

},{threshold:0.4});

observer.observe(document.querySelector(".story-text"));
