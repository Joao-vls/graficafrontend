import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-form-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './order-form-section.component.html',
  styleUrl: './order-form-section.component.scss'
})
export class OrderFormSection implements OnInit {
  orderForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      notes: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      city: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      console.log('Dados do Pedido Enviados:', this.orderForm.value);
      // Aqui você acopla a sua chamada HTTP ou serviço de backend posterior
    }
  }
}