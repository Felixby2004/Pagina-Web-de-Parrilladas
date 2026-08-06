import nodemailer from 'nodemailer';
import env from './env.js';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

// Función para obtener la dirección IPv4 de smtp.gmail.com
const getSmtpHostIPv4 = async () => {
  try {
    const result = await lookup('smtp.gmail.com', { family: 4 });
    return result.address;
  } catch (error) {
    console.error('❌ No se pudo resolver smtp.gmail.com a IPv4:', error);
    return 'smtp.gmail.com'; // fallback
  }
};

// Configuración del transporter
let transporter = null;

const createTransporter = async () => {
  const host = await getSmtpHostIPv4();
  
  transporter = nodemailer.createTransport({
    host: host,          // Usamos la IP IPv4 directamente
    port: 465,
    secure: true,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    // Timeouts para evitar bloqueos
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
  
  console.log(`✅ Transporter configurado con host: ${host}`);
  return transporter;
};

// Inicializar el transporter al arrancar el servidor
await createTransporter();

export const enviarCorreoVerificacion = async (destinatario, codigo) => {
  if (!transporter) {
    await createTransporter();
  }

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
    const info = await transporter.sendMail({
      from: `"Parrilladas" <${env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Código de verificación - Parrilladas',
      html,
    });
    console.log(`✅ Correo de verificación enviado a ${destinatario}`);
    return info;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message);
    console.error('❌ Código de error:', error.code);
    console.error('❌ Respuesta del servidor:', error.response);
    throw new Error('No se pudo enviar el correo de verificación. Revisa la configuración del email.');
  }
};

export const enviarCorreoRecuperacion = async (destinatario, codigo) => {
  if (!transporter) {
    await createTransporter();
  }

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
    console.error('❌ Error al enviar correo:', error.message);
    throw new Error('No se pudo enviar el correo de recuperación. Revisa la configuración del email.');
  }
};