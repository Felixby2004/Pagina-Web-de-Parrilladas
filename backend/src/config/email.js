import nodemailer from 'nodemailer';
import env from './env.js';

// Configuración del transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// Función para enviar correo de verificación
export const enviarCorreoVerificacion = async (destinatario, codigo) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #d32f2f;">Verificación de cuenta</h2>
      <p>Hola,</p>
      <p>Gracias por registrarte. Para completar tu registro, ingresa el siguiente código de verificación:</p>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 4px; border-radius: 4px; margin: 20px 0;">
        <strong>${codigo}</strong>
      </div>
      <p>Este código expirará en 15 minutos.</p>
      <p>Si no solicitaste este registro, ignora este mensaje.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">Parrilladas - Sistema de gestión</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Parrilladas" <${env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Código de verificación - Parrilladas',
    html,
  });
};

// Función para enviar correo de recuperación de contraseña
export const enviarCorreoRecuperacion = async (destinatario, codigo) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #d32f2f;">Recuperación de contraseña</h2>
      <p>Hola,</p>
      <p>Hemos recibido una solicitud para restablecer tu contraseña. Ingresa el siguiente código:</p>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 4px; border-radius: 4px; margin: 20px 0;">
        <strong>${codigo}</strong>
      </div>
      <p>Este código expirará en 15 minutos.</p>
      <p>Si no solicitaste este cambio, ignora este mensaje y tu contraseña permanecerá segura.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">Parrilladas - Sistema de gestión</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Parrilladas" <${env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Recuperación de contraseña - Parrilladas',
    html,
  });
};