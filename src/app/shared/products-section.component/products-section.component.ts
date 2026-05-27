import { Component, ElementRef, ViewChild, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-products-section',
  standalone: true,
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss'
})
export class ProductsSection implements OnInit, OnDestroy {
  @ViewChild('productsCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = false;
  private observer: IntersectionObserver | null = null;

  // Sequência de frames destinada a este bloco (ex: do frame 66 ao 85)
  private readonly startFrame = 59;
  private readonly endFrame = 71;
  private images: HTMLImageElement[] = [];
  private currentFrameIndex = 0;
  private animationId: number | null = null;
  private fps = 30;
  private lastTime = 0;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.configurarGatilho();
    }
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.observer) this.observer.disconnect();
  }

  private configurarGatilho() {
    const opcoes = { root: null, threshold: 0.2 };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.preloadImages();
          if (this.observer) this.observer.disconnect();
        }
      });
    }, opcoes);

    const elementoHtml = this.canvasRef.nativeElement.parentElement;
    if (elementoHtml) this.observer.observe(elementoHtml);
  }

  private preloadImages() {
    const totalFramesToLoad = this.endFrame - this.startFrame + 1;
    let loadedCount = 0;

    for (let i = this.startFrame; i <= this.endFrame; i++) {
      const img = new Image();
      img.src = `assets/frames/tinta${i}.png`;
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFramesToLoad) {
          this.resizeCanvas();
          this.startAnimation();
        }
      };

      img.onerror = (err) => {
        console.error(`Erro ao carregar: assets/frames/tinta${i}.png`, err);
      };

      this.images.push(img);
    }
  }

  private startAnimation() {
    const animate = (currentTime: number) => {
      if (!this.lastTime) this.lastTime = currentTime;
      const delta = currentTime - this.lastTime;
      const interval = 1000 / this.fps;

      if (delta >= interval) {
        this.lastTime = currentTime;
        this.render();
        this.currentFrameIndex++;
      }

      if (this.currentFrameIndex < this.images.length) {
        this.animationId = requestAnimationFrame(animate);
      }
    };
    this.animationId = requestAnimationFrame(animate);
  }

  private render() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const img = this.images[this.currentFrameIndex];

    if (!ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    let dWidth, dHeight, dX, dY;

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

    ctx.drawImage(img, dX, dY, dWidth, dHeight);
  }

  private resizeCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
}