import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { QRCodeSVGModule } from 'ngx-qrcode-svg';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    QRCodeSVGModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-xtrim-purple mb-4">Bienvenido al Sistema de Turnos Xtrim</h1>
          <p class="text-lg text-gray-600">
            Escanea el código QR para reservar un turno desde tu dispositivo móvil
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
            <h2 class="text-xl font-semibold mb-6 text-xtrim-purple">Código QR para Reservar Turno</h2>
            
            <div class="mb-6 flex justify-center">
              <qrcode-svg [value]="qrValue" [width]="200" [height]="200"></qrcode-svg>
            </div>
            
            <p class="text-sm text-gray-500 text-center mb-4">
              Escanea este código con la cámara de tu teléfono para acceder a la página de reserva de turnos
            </p>
            
            <button 
              mat-raised-button 
              color="primary" 
              routerLink="/booking" 
              class="bg-xtrim-purple text-white">
              Reservar Turno
            </button>
          </div>
          
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold mb-4 text-xtrim-purple">Acceso al Sistema</h2>
            
            <p class="text-gray-600 mb-6">
              Si eres empleado de Xtrim, inicia sesión para acceder al sistema de gestión de turnos.
            </p>
            
            <div class="space-y-4">
              <button 
                mat-raised-button 
                color="primary" 
                routerLink="/login" 
                class="w-full bg-xtrim-purple text-white">
                Iniciar Sesión
              </button>
              
              <div class="text-center text-sm text-gray-500">
                <p>Acceso exclusivo para personal autorizado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  qrValue = '';
  
  ngOnInit(): void {
    // Default branch ID is 1 for this example
    const branchId = 1;
    
    // Generate QR code value with the current URL
    const baseUrl = window.location.origin;
    this.qrValue = `${baseUrl}/booking?branchId=${branchId}`;
  }
}