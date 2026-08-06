import nodemailer from 'nodemailer';
import env from './env.js';

// ============================================================
// 1. Configurar el transporter con OAuth2
// ============================================================
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    type: 'OAuth2',
    user: env.EMAIL_USER,
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    refreshToken: env.GOOGLE_REFRESH_TOKEN,
  },
  // Timeouts para evitar bloqueos
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

// ============================================================
// 2. Verificar la conexión al iniciar (opcional)
// ============================================================
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error al conectar con Gmail (OAuth2):', error.message);
    console.error('Detalles:', error);
  } else {
    console.log('✅ Transporter de Gmail (OAuth2) listo para enviar correos');
  }
});

// ============================================================
// 3. Función para enviar correo de verificación
// ============================================================
export const enviarCorreoVerificacion = async (destinatario, codigo) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
      <h2 style="color: #d32f2f; text-align: center;">Verificación de cuenta</h2>
      <p>Hola,</p>
      <p>Gracias por registrarte en <strong>Parrilladas</strong>. Para completar tu registro, ingresa el siguiente código de verificación:</p>
      <div style="background: #ffffff; padding: 15px; text-align: center; font-size: 32px; letter-spacing: 6px; border-radius: 6px; border: 2px dashed #d32f2f; margin: 20px 0;">
        <strong>${codigo}</strong>
      </div>
      <p>Este código expirará en <strong>15 minutos</strong>.</p>
      <p>Si no solicitaste este registro, ignora este mensaje.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px; text-align: center;">Parrilladas - Sistema de gestión</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Parrilladas" <${env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Código de verificación - Parrilladas',
      html,
    });
    console.log(`✅ Correo de verificación enviado a ${destinatario}`);
    return info;
  } catch (error) {
    console.error('❌ Error al enviar correo de verificación:');
    console.error('  - Mensaje:', error.message);
    console.error('  - Código:', error.code);
    if (error.response) {
      console.error('  - Respuesta del servidor:', error.response);
    }
    throw new Error('No se pudo enviar el correo de verificación. Revisa la configuración del email.');
  }
};

// ============================================================
// 4. Función para enviar correo de recuperación de contraseña
// ============================================================
export const enviarCorreoRecuperacion = async (destinatario, codigo) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
      <h2 style="color: #d32f2f; text-align: center;">Recuperación de contraseña</h2>
      <p>Hola,</p>
      <p>Hemos recibido una solicitud para restablecer tu contraseña en <strong>Parrilladas</strong>. Ingresa el siguiente código:</p>
      <div style="background: #ffffff; padding: 15px; text-align: center; font-size: 32px; letter-spacing: 6px; border-radius: 6px; border: 2px dashed #d32f2f; margin: 20px 0;">
        <strong>${codigo}</strong>
      </div>
      <p>Este código expirará en <strong>15 minutos</strong>.</p>
      <p>Si no solicitaste este cambio, ignora este mensaje y tu contraseña permanecerá segura.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px; text-align: center;">Parrilladas - Sistema de gestión</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Parrilladas" <${env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Recuperación de contraseña - Parrilladas',
      html,
    });
    console.log(`✅ Correo de recuperación enviado a ${destinatario}`);
    return info;
  } catch (error) {
    console.error('❌ Error al enviar correo de recuperación:');
    console.error('  - Mensaje:', error.message);
    console.error('  - Código:', error.code);
    if (error.response) {
      console.error('  - Respuesta del servidor:', error.response);
    }
    throw new Error('No se pudo enviar el correo de recuperación. Revisa la configuración del email.');
  }
};