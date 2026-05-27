import { Component, ElementRef, ViewChild, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-services-section',
  standalone: true,
  templateUrl: './services-section.html',
  styleUrl: './services-section.scss'
})
export class ServicesSection implements OnInit, OnDestroy {
  @ViewChild('servicesCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = false;
  private observer: IntersectionObserver | null = null;

  // Seus blocos de frames específicos (tinta21.png até tinta45.png)
  private readonly startFrame = 24;
  private readonly endFrame = 40;
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
      this.configurarGatilhoDeVisibilidade();
    }
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.observer) this.observer.disconnect();
  }

  private configurarGatilhoDeVisibilidade() {
    // Configura o observador para disparar quando 20% (0.2) da seção aparecer na tela
    const opcoes = {
      root: null,
      threshold: 0.2
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // O componente apareceu! Agora sim carregamos e rodamos os frames
          this.preloadImages();
          
          // Desconecta o observer para a animação não ficar reiniciando se o usuário subir/descer
          if (this.observer) this.observer.disconnect();
        }
      });
    }, opcoes);

    // Começa a observar este componente HTML
    const elementoHtml = this.canvasRef.nativeElement.parentElement;
    if (elementoHtml) {
      this.observer.observe(elementoHtml);
    }
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

      // Para no último frame da sequência fazendo ele se tornar o fundo definitivo
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