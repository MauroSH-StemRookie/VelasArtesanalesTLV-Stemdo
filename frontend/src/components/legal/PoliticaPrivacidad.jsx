import { useEffect, useState } from "react";
import "./PoliticaPrivacidad.css";

export default function PoliticaPrivacidad() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    window.scrollTo(0, 0);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="privacidad-container">
        <h2 style={{ textAlign: "center" }}>Cargando contenido...</h2>
      </div>
    );
  }
  return (
    <div className="privacidad-container">
      <h1>🔐 POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS</h1>

      <p>
        Respetando lo establecido en la legislación vigente, Artesanas de Velas
        (en adelante, también Sitio Web) se compromete a adoptar las medidas
        técnicas y organizativas necesarias, según el nivel de seguridad
        adecuado al riesgo de los datos recogidos.
      </p>

      <h2>Leyes que incorpora esta política de privacidad</h2>
      <p>
        Esta política de privacidad está adaptada a la normativa española y
        europea vigente en materia de protección de datos personales en
        internet. En concreto, la misma respeta las siguientes normas:
      </p>

      <p>
        El Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27
        de abril de 2016, relativo a la protección de las personas físicas en lo
        que respecta al tratamiento de datos personales y a la libre circulación
        de estos datos (RGPD).
      </p>

      <p>
        La Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos
        Personales y garantía de los derechos digitales (LOPD-GDD).
      </p>

      <p>
        El Real Decreto 1720/2007, de 21 de diciembre, por el que se aprueba el
        Reglamento de desarrollo de la Ley Orgánica 15/1999, de 13 de diciembre,
        de Protección de Datos de Carácter Personal (RDLOPD).
      </p>

      <p>
        La Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
        Información y de Comercio Electrónico (LSSI-CE).
      </p>

      <h2>Registro de Datos de Carácter Personal</h2>

      <p>
        En cumplimiento de lo establecido en el RGPD y la LOPD-GDD, le
        informamos que los datos personales recabados por Artesanas de Velas,
        mediante los formularios extendidos en sus páginas quedarán incorporados
        y serán tratados en nuestro fichero con el fin de poder facilitar,
        agilizar y cumplir los compromisos establecidos entre Artesanas de Velas
        y el Usuario o el mantenimiento de la relación que se establezca en los
        formularios que este rellene, o para atender una solicitud o consulta
        del mismo. Asimismo, de conformidad con lo previsto en el RGPD y la
        LOPD-GDD, salvo que sea de aplicación la excepción prevista en el
        artículo 30.5 del RGPD, se mantiene un registro de actividades de
        tratamiento que especifica, según sus finalidades, las actividades de
        tratamiento llevadas a cabo y las demás circunstancias establecidas en
        el RGPD.
      </p>

      <h2>Principios aplicables al tratamiento de los datos personales</h2>

      <p>
        El tratamiento de los datos personales del Usuario se someterá a los
        siguientes principios recogidos en el artículo 5 del RGPD y en el
        artículo 4 y siguientes de la Ley Orgánica 3/2018, de 5 de diciembre, de
        Protección de Datos Personales y garantía de los derechos digitales:
      </p>

      <p>
        Principio de licitud, lealtad y transparencia: se requerirá en todo
        momento el consentimiento del Usuario previa información completamente
        transparente de los fines para los cuales se recogen los datos
        personales.
      </p>

      <p>
        Principio de limitación de la finalidad: los datos personales serán
        recogidos con fines determinados, explícitos y legítimos.
      </p>
      <p>
        Principio de minimización de datos: los datos personales recogidos serán
        únicamente los estrictamente necesarios en relación con los fines para
        los que son tratados.
      </p>

      <p>
        Principio de exactitud: los datos personales deben ser exactos y estar
        siempre actualizados.
      </p>

      <p>
        Principio de limitación del plazo de conservación: los datos personales
        solo serán mantenidos de forma que se permita la identificación del
        Usuario durante el tiempo necesario para los fines de su tratamiento.
      </p>

      <p>
        Principio de integridad y confidencialidad: los datos personales serán
        tratados de manera que se garantice su seguridad y confidencialidad.
      </p>

      <p>
        Principio de responsabilidad proactiva: el Responsable del tratamiento
        será responsable de asegurar que los principios anteriores se cumplen.
      </p>

      <h2>Categorías de datos personales</h2>

      <p>
        Las categorías de datos que se tratan en Artesanas de Velas son
        únicamente datos identificativos. En ningún caso, se tratan categorías
        especiales de datos personales en el sentido del artículo 9 del RGPD.
      </p>

      <h2>Base legal para el tratamiento de los datos personales</h2>

      <p>
        La base legal para el tratamiento de los datos personales es el
        consentimiento. Artesanas de Velas se compromete a recabar el
        consentimiento expreso y verificable del Usuario para el tratamiento de
        sus datos personales para uno o varios fines específicos.
      </p>

      <p>
        El Usuario tendrá derecho a retirar su consentimiento en cualquier
        momento. Será tan fácil retirar el consentimiento como darlo. Como regla
        general, la retirada del consentimiento no condicionará el uso del Sitio
        Web.
      </p>

      <p>
        En las ocasiones en las que el Usuario deba o pueda facilitar sus datos
        a través de formularios para realizar consultas, solicitar información o
        por motivos relacionados con el contenido del Sitio Web, se le informará
        en caso de que la cumplimentación de alguno de ellos sea obligatoria
        debido a que los mismos sean imprescindibles para el correcto desarrollo
        de la operación realizada.
      </p>

      <h2>Fines del tratamiento a que se destinan los datos personales</h2>

      <p>
        Los datos personales son recabados y gestionados por Artesanas de Velas
        con la finalidad de poder facilitar, agilizar y cumplir los compromisos
        establecidos entre el Sitio Web y el Usuario o el mantenimiento de la
        relación que se establezca en los formularios que este último rellene o
        para atender una solicitud o consulta. Igualmente, los datos podrán ser
        utilizados con una finalidad comercial de personalización, operativa y
        estadística, y actividades propias del objeto social de Artesanas de
        Velas, así como para la extracción, almacenamiento de datos y estudios
        de marketing para adecuar el Contenido ofertado al Usuario, así como
        mejorar la calidad, funcionamiento y navegación por el Sitio Web.
      </p>

      <p>
        En el momento en que se obtengan los datos personales, se informará al
        Usuario acerca del fin o fines específicos del tratamiento a que se
        destinarán los datos personales; es decir, del uso o usos que se dará a
        la información recopilada.
      </p>

      <h2>Períodos de retención de los datos personales</h2>

      <p>
        Los datos personales solo serán retenidos durante el tiempo mínimo
        necesario para los fines de su tratamiento y, en todo caso, únicamente
        durante el siguiente plazo: , o hasta que el Usuario solicite su
        supresión.
      </p>

      <p>
        En el momento en que se obtengan los datos personales, se informará al
        Usuario acerca del plazo durante el cual se conservarán los datos
        personales o, cuando eso no sea posible, los criterios utilizados para
        determinar este plazo.
      </p>

      <h2>Destinatarios de los datos personales</h2>

      <p>
        Los datos personales del Usuario serán compartidos con los siguientes
        destinatarios o categorías de destinatarios:
      </p>

      <p>
        En caso de que el Responsable del tratamiento tenga la intención de
        transferir datos personales a un tercer país u organización
        internacional, en el momento en que se obtengan los datos personales, se
        informará al Usuario acerca del tercer país u organización internacional
        al cual se tiene la intención de transferir los datos, así como de la
        existencia o ausencia de una decisión de adecuación de la Comisión.
      </p>

      <h2>Datos personales de menores de edad</h2>

      <p>
        Respetando lo establecido en los artículos 8 del RGPD y 7 de la Ley
        Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y
        garantía de los derechos digitales, solo los mayores de 14 años podrán
        otorgar su consentimiento para el tratamiento de sus datos personales de
        forma lícita por Artesanas de Velas. Si se trata de un menor de 14 años,
        será necesario el consentimiento de los padres o tutores para el
        tratamiento, y este solo se considerará lícito en la medida en la que
        los mismos lo hayan autorizado.
      </p>

      <h2>Secreto y seguridad de los datos personales</h2>

      <p>
        Artesanas de Velas se compromete a adoptar las medidas técnicas y
        organizativas necesarias, según el nivel de seguridad adecuado al riesgo
        de los datos recogidos, de forma que se garantice la seguridad de los
        datos de carácter personal y se evite la destrucción, pérdida o
        alteración accidental o ilícita de datos personales transmitidos,
        conservados o tratados de otra forma, o la comunicación o acceso no
        autorizados a dichos datos.
      </p>

      <p>
        Los datos personales serán tratados como confidenciales por el
        Responsable del tratamiento, quien se compromete a informar de y a
        garantizar por medio de una obligación legal o contractual que dicha
        confidencialidad sea respetada por sus empleados, asociados, y toda
        persona a la cual le haga accesible la información.
      </p>

      <h2>Derechos derivados del tratamiento de los datos personales</h2>
      <p>
        El Usuario tiene sobre Artesanas de Velas y podrá, por tanto, ejercer
        frente al Responsable del tratamiento los siguientes derechos
        reconocidos en el RGPD y la Ley Orgánica 3/2018, de 5 de diciembre, de
        Protección de Datos Personales y garantía de los derechos digitales:
      </p>

      <p>
        Derecho de acceso: Es el derecho del Usuario a obtener confirmación de
        si Artesanas de Velas está tratando o no sus datos personales y, en caso
        afirmativo, obtener información sobre sus datos concretos de carácter
        personal y del tratamiento que Artesanas de Velas haya realizado o
        realice,así como, entre otra, de la información disponible sobre el
        origen de dichos datos y los destinatarios de las comunicaciones
        realizadas o previstas de los mismos.
      </p>

      <p>
        Derecho de rectificación: Es el derecho del Usuario a que se modifiquen
        sus datos personales que resulten ser inexactos o, teniendo en cuenta
        los fines del tratamiento, incompletos.
      </p>

      <p>
        Derecho de supresión (\"el derecho al olvido\"): Es el derecho del
        Usuario, siempre que la legislación vigente no establezca lo contrario,
        a obtener la supresión de sus datos personales cuando estos ya no sean
        necesarios para los fines para los cuales fueron recogidos o tratados;
        el Usuario haya retirado su consentimiento al tratamiento y este no
        cuente con otra base legal; el Usuario se oponga al tratamiento y no
        exista otro motivo legítimo para continuar con el mismo; los datos
        personales hayan sido tratados ilícitamente; los datos personales deban
        suprimirse en cumplimiento de una obligación legal; o los datos
        personales hayan sido obtenidos producto de una oferta directa de
        servicios de la sociedad de la información a un menor de 14 años. Además
        de suprimir los datos, el Responsable del tratamiento, teniendo en
        cuenta la tecnología disponible y el coste de su aplicación, deberá
        adoptar medidas razonables para informar a los responsables que estén
        tratando los datos personales de la solicitud del interesado de
        supresión de cualquier enlace a esos datos personales.
      </p>

      <p>
        Derecho a la limitación del tratamiento: Es el derecho del Usuario a
        limitar el tratamiento de sus datos personales. El Usuario tiene derecho
        a obtener la limitación del tratamiento cuando impugne la exactitud de
        sus datos personales; el tratamiento sea ilícito; el Responsable del
        tratamiento ya no necesite los datos personales, pero el Usuario lo
        necesite para hacer reclamaciones; y cuando el Usuario se haya opuesto
        al tratamiento.
      </p>

      <p>
        Derecho a la portabilidad de los datos: En caso de que el tratamiento se
        efectúe por medios automatizados, el Usuario tendrá derecho a recibir
        del Responsable del tratamiento sus datos personales en un formato
        estructurado, de uso común y lectura mecánica, y a transmitirlos a otro
        responsable del tratamiento. Siempre que sea técnicamente posible, el
        Responsable del tratamiento transmitirá directamente los datos a ese
        otro responsable.
      </p>

      <p>
        Derecho de oposición: Es el derecho del Usuario a que no se lleve a cabo
        el tratamiento de sus datos de carácter personal o se cese el
        tratamiento de los mismos por parte de Artesanas de Velas.
      </p>

      <p>
        Derecho a no ser objeto de una decisión basada únicamente en el
        tratamiento automatizado, incluida la elaboración de perfiles: Es el
        derecho del Usuario a no ser objeto de una decisión individualizada
        basada únicamente en el tratamiento automatizado de sus datos
        personales, incluida la elaboración de perfiles, existente salvo que la
        legislación vigente establezca lo contrario.
      </p>

      <p>
        Así pues, el Usuario podrá ejercitar sus derechos mediante comunicación
        escrita dirigida al Responsable del tratamiento con la referencia{" "}
        <a
          href="http://localhost:5173/"
          target="_blank"
          rel="noopener noreferrer"
        >
          http://localhost:5173/
        </a>
        , especificando:
      </p>

      <p>
        Nombre, apellidos del Usuario y copia del DNI. En los casos en que se
        admita la representación, será también necesaria la identificación por
        el mismo medio de la persona que representa al Usuario, así como el
        documento acreditativo de la representación. La fotocopia del DNI podrá
        ser sustituida, por cualquier otro medio válido en derecho que acredite
        la identidad.
      </p>

      <p>
        Petición con los motivos específicos de la solicitud o información a la
        que se quiere acceder.
      </p>

      <p>Domicilio a efecto de notificaciones.</p>
      <p>Fecha y firma del solicitante.</p>
      <p>Todo documento que acredite la petición que formula.</p>

      <h2>Enlaces a sitios web de terceros</h2>

      <p>
        El Sitio Web puede incluir hipervínculos o enlaces que permiten acceder
        a páginas web de terceros distintos de Artesanas de Velas, y que por
        tanto no son operados por Artesanas de Velas. Los titulares de dichos
        sitios web dispondrán de sus propias políticas de protección de datos,
        siendo ellos mismos, en cada caso, responsables de sus propios ficheros
        y de sus propias prácticas de privacidad.
      </p>

      <h2>Reclamaciones ante la autoridad de control</h2>

      <p>
        En caso de que el Usuario considere que existe un problema o infracción
        de la normativa vigente en la forma en la que se están tratando sus
        datos personales, tendrá derecho a la tutela judicial efectiva y a
        presentar una reclamación ante una autoridad de control, en particular,
        en el Estado en el que tenga su residencia habitual, lugar de trabajo o
        lugar de la supuesta infracción. En el caso de España, la autoridad de
        control es la Agencia Española de Protección de Datos (
        <a
          href="https://www.aepd.es/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://www.aepd.es/
        </a>
        ).
      </p>

      <h1>ACEPTACIÓN Y CAMBIOS EN ESTA POLÍTICA DE PRIVACIDAD</h1>

      <p>
        Es necesario que el Usuario haya leído y esté conforme con las
        condiciones sobre la protección de datos de carácter personal contenidas
        en esta Política de Privacidad, así como que acepte el tratamiento de
        sus datos personales para que el Responsable del tratamiento pueda
        proceder al mismo en la forma, durante los plazos y para las finalidades
        indicadas. El uso del Sitio Web implicará la aceptación de la Política
        de Privacidad del mismo.
      </p>

      <p>
        Artesanas de Velas se reserva el derecho a modificar su Política de
        Privacidad, de acuerdo a su propio criterio, o motivado por un cambio
        legislativo, jurisprudencial o doctrinal de la Agencia Española de
        Protección de Datos. Los cambios o actualizaciones de esta Política de
        Privacidad no serán notificados de forma explícita al Usuario. Se
        recomienda al Usuario consultar esta página de forma periódica para
        estar al tanto de los últimos cambios o actualizaciones.
      </p>

      <p>
        Esta Política de Privacidad fue actualizada para adaptarse al Reglamento
        (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de
        2016, relativo a la protección de las personas físicas en lo que
        respecta al tratamiento de datos personales y a la libre circulación de
        estos datos (RGPD) y a la Ley Orgánica 3/2018, de 5 de diciembre, de
        Protección de Datos Personales y garantía de los derechos digitales.
        Este documento de Política de Privacidad de un sitio web ha sido creado
        mediante el generador de plantilla de política de privacidad web gratis
        online el día 13/04/2026.
      </p>
    </div>
  );
}
