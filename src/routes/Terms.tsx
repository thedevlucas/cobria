import { Container, Typography, Paper, Box } from "@mui/material";

export default function TermsPage() {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          TÉRMINOS Y CONDICIONES DE USO DE LA PLATAFORMA COBRIA
        </Typography>

        <Typography variant="body1" paragraph>
          Fecha de última actualización: 20/02/2025
        </Typography>

        <Box sx={{ maxHeight: "60vh", overflowY: "auto", p: 2 }}>
          <Typography variant="h6" gutterBottom>
            1. INTRODUCCIÓN
          </Typography>
          <Typography variant="body2" paragraph>
            Estos Términos y Condiciones regulan el acceso y uso de la
            plataforma Cobria, un servicio de cobranza extrajudicial
            automatizada mediante inteligencia artificial, operado por LUIS
            FERNANDO MORLA MORA con domicilio en Quito y debidamente constituida
            bajo las leyes de la República del Ecuador. Al acceder y utilizar
            Cobria, el usuario acepta estos términos y condiciones en su
            totalidad. Si no está de acuerdo con ellos, deberá abstenerse de
            utilizar la plataforma.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. DEFINICIONES
          </Typography>
          <Typography variant="body2" paragraph>
            - <strong>Plataforma:</strong> Sistema digital de cobranza
            extrajudicial automatizada desarrollado y operado por Cobria.
            <br />- <strong>Usuario:</strong> Persona natural o jurídica que
            accede y utiliza la plataforma para la gestión de cobranzas.
            <br />- <strong>Agente de IA:</strong> Inteligencia artificial
            designada para la gestión de cobranzas a nombre del usuario.
            <br />- <strong>Cliente:</strong> Empresa o persona que contrata los
            servicios de Cobria para recuperar sus deudas pendientes.
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. CONDICIONES DE USO
          </Typography>
          <Typography variant="body2" paragraph>
            - El usuario debe proporcionar información veraz y actualizada para
            el correcto funcionamiento del servicio.
            <br />
            - El usuario será el único responsable del uso de la plataforma y de
            la legalidad de sus acciones de cobranza.
            <br />- Cobria se reserva el derecho de suspender o cancelar cuentas
            en caso de uso indebido o incumplimiento de estos términos.
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. COSTOS Y PAGOS
          </Typography>
          <Typography variant="body2" paragraph>
            - El uso de la plataforma está sujeto a una suscripción mensual de
            $250 USD.
            <br />
            - Cada agente de IA con su número de teléfono adicional tendrá un
            costo mensual extra.
            <br />
            - El usuario asume los costos operativos de las gestiones de
            cobranza, incluyendo llamadas y mensajes enviados.
            <br />- Los pagos se realizarán de manera mensual a través de los
            métodos de pago habilitados en la plataforma.
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. PROPIEDAD INTELECTUAL
          </Typography>
          <Typography variant="body2" paragraph>
            - Todos los derechos de propiedad intelectual sobre la plataforma,
            incluyendo software, algoritmos y diseño, son propiedad de Cobria.
            <br />- Queda prohibida la reproducción, distribución o modificación
            no autorizada de cualquier elemento de la plataforma.
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. RESPONSABILIDAD
          </Typography>
          <Typography variant="body2" paragraph>
            - Cobria no garantiza la recuperación total de los montos adeudados,
            ya que el resultado de la cobranza depende de múltiples factores
            externos.
            <br />
            - Cobria no será responsable por el uso indebido que los usuarios
            hagan de la plataforma.
            <br />- El usuario exonera a Cobria de cualquier reclamación
            derivada del uso de la plataforma en contra de las leyes aplicables.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. PROTECCIÓN DE DATOS PERSONALES
          </Typography>
          <Typography variant="body2" paragraph>
            - Cobria cumple con la normativa vigente en materia de protección de
            datos personales en la República del Ecuador.
            <br />- La información del usuario y de los deudores será tratada
            con estricta confidencialidad y solo para los fines del servicio.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. MODIFICACIONES A LOS TÉRMINOS Y CONDICIONES
          </Typography>
          <Typography variant="body2" paragraph>
            - Cobria se reserva el derecho de modificar estos términos y
            condiciones en cualquier momento. Las modificaciones serán
            notificadas a los usuarios mediante la plataforma o correo
            electrónico.
            <br />- El uso continuo de la plataforma tras la publicación de
            cambios implica la aceptación de los mismos.
          </Typography>

          <Typography variant="h6" gutterBottom>
            9. JURISDICCIÓN Y LEGISLACIÓN APLICABLE
          </Typography>
          <Typography variant="body2" paragraph>
            - Estos términos y condiciones se rigen por las leyes de la
            República del Ecuador.
            <br />- Cualquier controversia derivada del uso de la plataforma
            será resuelta ante los tribunales de la República del Ecuador.
          </Typography>

          <Typography variant="h6" gutterBottom>
            10. CONTACTO
          </Typography>
          <Typography variant="body2" paragraph>
            Para cualquier consulta o reclamación sobre estos términos y
            condiciones, el usuario puede contactarnos en{" "}
            <a href="mailto:luis-fernando-10@outlook.es">
              luis-fernando-10@outlook.es
            </a>
            .
          </Typography>
        </Box>

        <Typography variant="body2" mt={2}>
          Última actualización: 20/02/2025
        </Typography>
      </Paper>
    </Container>
  );
}
