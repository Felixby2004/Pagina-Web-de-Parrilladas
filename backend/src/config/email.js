import nodemailer from 'nodemailer';
import env from './env.js';

// Configuración del transporter con resolución de IPv4
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL (para puerto 465)
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  // 👇 Forzar el uso de IPv4
  connectionTimeout: 10000, // 10 segundos
  greetingTimeout: 10000,
  // Esto fuerza que el socket use IPv4
  socketOptions: {
    family: 4, // 4 = IPv4, 6 = IPv6
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

  try {
    await transporter.sendMail({
      from: `"Parrilladas" <${env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Código de verificación - Parrilladas',
      html,
    });
    console.log(`✅ Correo de verificación enviado a ${destinatario}`);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw new Error('No se pudo enviar el correo de verificación. Revisa la configuración del email.');
  }
};

// Función para enviar correo de recuperación
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

  try {
    await transporter.sendMail({
      from: `"Parrilladas" <${env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Recuperación de contraseña - Parrilladas',
      html,
    });
    console.log(`✅ Correo de recuperación enviado a ${destinatario}`);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw new Error('No se pudo enviar el correo de recuperación. Revisa la configuración del email.');
  }
};