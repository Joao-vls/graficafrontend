import { Component, ElementRef, ViewChild, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss'
})
export class HeroSection implements OnInit, OnDestroy {
  @ViewChild('heroCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = false;

  // Configuração específica para este componente
  private readonly totalFrames = 23; // Digamos que os frames 1 a 24 são para o Hero
  private images: HTMLImageElement[] = [];
  private frameIndex = 0;
  private animationId: number | null = null;
  private fps = 30;
  private lastTime = 0;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.preloadImages();
    }
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private preloadImages() {
    for (let i = 1; i <= this.totalFrames; i++) {
      const img = new Image();
      // Ajuste o caminho para seus frames iniciais
      img.src = `assets/frames/tinta${i}.png`;
      img.decode?.().then(() => this.images.push(img));
      this.images.push(img);
    }

    // Inicia a animação após um pequeno delay para carregar os primeiros frames
    setTimeout(() => {
      this.resizeCanvas();
      this.startAnimation();
    }, 100);
  }

  private startAnimation() {
    const animate = (currentTime: number) => {
      if (!this.lastTime) this.lastTime = currentTime;
      const delta = currentTime - this.lastTime;
      const interval = 1000 / this.fps;

      if (delta >= interval) {
        this.lastTime = currentTime;
        this.render();
        this.frameIndex++;
      }

      if (this.frameIndex < this.totalFrames) {
        this.animationId = requestAnimationFrame(animate);
      }
    };
    this.animationId = requestAnimationFrame(animate);
  }

  private render() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const img = this.images[this.frameIndex];

    if (!ctx || !img) return;

    // Limpa e desenha respeitando o aspecto "cover"
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
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
}