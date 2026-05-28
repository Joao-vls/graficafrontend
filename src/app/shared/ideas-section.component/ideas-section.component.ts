import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
  PLATFORM_ID
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

interface SlideItem {
  image: string;
  alt: string;
}

@Component({
  selector: 'app-ideas-section',
  standalone: true,
  templateUrl: './ideas-section.component.html',
  styleUrl: './ideas-section.component.scss'
})
export class IdeasSection implements OnInit, OnDestroy {

  @ViewChild('ideasCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = false;

  private observer: IntersectionObserver | null = null;

  // =========================================
  // SLIDES
  // =========================================

  slides: SlideItem[] = [
    {
      image: 'assets/ideas/ideas1.png',
      alt: 'Projeto Wine'
    },
    {
      image: 'assets/ideas/ideas2.png',
      alt: 'Projeto Fachada'
    },
    {
      image: 'assets/ideas/ideas3.png',
      alt: 'Projeto Luminoso'
    },
    {
      image: 'assets/ideas/ideas4.png',
      alt: 'Projeto Comunicação'
    }
  ];

  currentSlide = 0;
  activeDot = 0;

  slideWidth = 385;

  private autoSlideInterval: any;

  // =========================================
  // CANVAS ANIMATION
  // =========================================

  private readonly startFrame = 41;
  private readonly endFrame = 58;

  private images: HTMLImageElement[] = [];

  private currentFrameIndex = 0;

  private animationId: number | null = null;

  private fps = 30;

  private lastTime = 0;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {

    if (!this.isBrowser) return;

    this.updateSlideWidth();

    this.startAutoSlide();

    this.configurarGatilho();
  }

  ngOnDestroy(): void {

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  // =========================================
  // RESPONSIVO
  // =========================================

  @HostListener('window:resize')
  onResize() {

    this.updateSlideWidth();

    this.resizeCanvas();
  }

  private updateSlideWidth() {

    if (window.innerWidth <= 768) {
      this.slideWidth = window.innerWidth * 0.85 + 24;
    } else {
      this.slideWidth = 385;
    }
  }

  // =========================================
  // SLIDER
  // =========================================

  private startAutoSlide() {

    this.autoSlideInterval = setInterval(() => {

      this.currentSlide++;

      if (this.currentSlide >= this.slides.length) {
        this.currentSlide = 0;
      }

      this.activeDot = this.currentSlide;

    }, 3500);
  }

  goToSlide(index: number) {

    this.currentSlide = index;
    this.activeDot = index;

    clearInterval(this.autoSlideInterval);

    this.startAutoSlide();
  }

  // =========================================
  // INTERSECTION OBSERVER
  // =========================================

  private configurarGatilho() {

    const opcoes = {
      root: null,
      threshold: 0.2
    };

    this.observer = new IntersectionObserver((entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          this.preloadImages();

          if (this.observer) {
            this.observer.disconnect();
          }
        }
      });

    }, opcoes);

    const elementoHtml = this.canvasRef.nativeElement.parentElement;

    if (elementoHtml) {
      this.observer.observe(elementoHtml);
    }
  }

  // =========================================
  // PRELOAD
  // =========================================

  private preloadImages() {

    const totalFramesToLoad =
      this.endFrame - this.startFrame + 1;

    let loadedCount = 0;

    for (
      let i = this.startFrame;
      i <= this.endFrame;
      i++
    ) {

      const img = new Image();

      img.src = `assets/frames/tinta${i}.png`;

      img.onload = () => {

        loadedCount++;

        if (loadedCount === totalFramesToLoad) {

          this.resizeCanvas();

          this.startAnimation();
        }
      };

      this.images.push(img);
    }
  }

  // =========================================
  // ANIMAÇÃO
  // =========================================

  private startAnimation() {

    const animate = (currentTime: number) => {

      if (!this.lastTime) {
        this.lastTime = currentTime;
      }

      const delta = currentTime - this.lastTime;

      const interval = 1000 / this.fps;

      if (delta >= interval) {

        this.lastTime = currentTime;

        this.render();

        this.currentFrameIndex++;
      }

      if (this.currentFrameIndex < this.images.length) {

        this.animationId =
          requestAnimationFrame(animate);
      }
    };

    this.animationId =
      requestAnimationFrame(animate);
  }

  // =========================================
  // RENDER
  // =========================================

  private render() {

    const canvas = this.canvasRef.nativeElement;

    const ctx = canvas.getContext('2d');

    const img =
      this.images[this.currentFrameIndex];

    if (!ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgRatio = img.width / img.height;

    const canvasRatio =
      canvas.width / canvas.height;

    let dWidth: number;
    let dHeight: number;
    let dX: number;
    let dY: number;

    if (canvasRatio > imgRatio) {

      dWidth = canvas.width;

      dHeight = canvas.width / imgRatio;

      dX = 0;

      dY = (canvas.height - dHeight) / 2;

    } else {

      dWidth = canvas.height * imgRatio;

      dHeight = canvas.height;

      dX = (canvas.width - dWidth) / 2;

      dY = 0;
    }

    ctx.drawImage(
      img,
      dX,
      dY,
      dWidth,
      dHeight
    );
  }

  // =========================================
  // CANVAS
  // =========================================

  private resizeCanvas() {

    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;

    canvas.width = canvas.offsetWidth;

    canvas.height = canvas.offsetHeight;
  }
}