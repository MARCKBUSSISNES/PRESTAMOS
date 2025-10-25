document.addEventListener('DOMContentLoaded', () => {
  const pages = document.querySelectorAll('.page');
  const navBtns = document.querySelectorAll('.nav-btn');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pages.forEach(p => p.classList.remove('active'));
      document.getElementById(btn.dataset.page).classList.add('active');
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // MODAL CLAVE
  const modal = document.getElementById('modalClave');
  const closeModal = document.querySelector('.close');
  let eliminarIndex = null;
  let eliminarTipo = null;
  const CLAVE = "1234"; // Cambiar por clave real

  closeModal.onclick = () => modal.style.display='none';
  window.onclick = e => { if(e.target==modal) modal.style.display='none'; }

  const confirmarEliminarBtn = document.getElementById('confirmarEliminar');
  confirmarEliminarBtn.onclick = () => {
    const clave = document.getElementById('claveEliminar').value;
    if(clave===CLAVE) {
      if(eliminarTipo==='cliente') eliminarClienteConfirm(eliminarIndex);
      if(eliminarTipo==='prestamo') eliminarPrestamoConfirm(eliminarIndex);
      modal.style.display='none';
      document.getElementById('claveEliminar').value='';
    } else alert('Clave incorrecta');
  };

  // --- CLIENTES ---
  const crearClienteBtn = document.getElementById('crearCliente');
  const listaClientes = document.getElementById('listaClientes');
  const clientePrestamoSelect = document.getElementById('clientePrestamo');

  crearClienteBtn.addEventListener('click', () => {
    const nombre = document.getElementById('nombreCliente').value.trim();
    const telefono = document.getElementById('telefonoCliente').value.trim();
    const email = document.getElementById('emailCliente').value.trim();
    const notas = document.getElementById('notasCliente').value.trim();
    if(!nombre){alert("Nombre obligatorio");return;}
    const clientes = JSON.parse(localStorage.getItem('clientes'))||[];
    clientes.push({nombre,telefono,email,notas});
    localStorage.setItem('clientes',JSON.stringify(clientes));
    document.getElementById('clienteForm').reset();
    mostrarClientes();
  });

  function mostrarClientes(){
    const clientes = JSON.parse(localStorage.getItem('clientes'))||[];
    listaClientes.innerHTML = clientes.map((c,i)=>`
      <div class="historial-item">
        <strong>${c.nombre}</strong> | ${c.telefono||''} | ${c.email||''}
        <p>${c.notas||''}</p>
        <button onclick="abrirModal('cliente',${i})">🗑 Eliminar</button>
      </div>
    `).join('');
    clientePrestamoSelect.innerHTML = `<option value="">Selecciona un cliente</option>`+
      clientes.map((c,i)=>`<option value="${i}">${c.nombre}</option>`).join('');
  }

  window.abrirModal = (tipo,index)=>{
    eliminarIndex=index; eliminarTipo=tipo; modal.style.display='block';
  }

  window.eliminarClienteConfirm = (i)=>{
    const clientes = JSON.parse(localStorage.getItem('clientes'))||[];
    clientes.splice(i,1);
    localStorage.setItem('clientes',JSON.stringify(clientes));
    mostrarClientes();
    mostrarHistorialPrestamos();
    actualizarPrestamoPago();
    mostrarPagos();
    mostrarReporte();
  }

  // --- PRÉSTAMOS ---
  const crearPrestamoBtn = document.getElementById('crearPrestamo');
  const historialPrestamos = document.getElementById('historialPrestamos');

  crearPrestamoBtn.addEventListener('click',()=>{
    const clienteIndex = clientePrestamoSelect.value;
    const monto = parseFloat(document.getElementById('monto').value);
    const interes = parseFloat(document.getElementById('interes').value);
    const plazo = parseInt(document.getElementById('plazo').value);
    if(clienteIndex===""||!monto||!interes||!plazo){alert("Completa campos");return;}
    const clientes = JSON.parse(localStorage.getItem('clientes'))||[];
    const cliente = clientes[clienteIndex];
    const totalPagar = monto + (monto*(interes/100));
    const cuotaMensual = (totalPagar/plazo).toFixed(2);
    const prestamos = JSON.parse(localStorage.getItem('prestamos'))||[];
    prestamos.push({
      cliente:cliente.nombre,
      monto,
      interes,
      plazo,
      totalPagar:totalPagar.toFixed(2),
      cuotaMensual,
      saldoPendiente:totalPagar.toFixed(2),
      fecha:new Date().toLocaleDateString()
    });
    localStorage.setItem('prestamos',JSON.stringify(prestamos));
    document.getElementById('loanForm').reset();
    mostrarHistorialPrestamos();
    actualizarPrestamoPago();
    mostrarReporte();
  });

  function mostrarHistorialPrestamos(){
    const prestamos = JSON.parse(localStorage.getItem('prestamos'))||[];
    historialPrestamos.innerHTML = prestamos.map((p,i)=>`
      <div class="historial-item">
        <strong>${p.cliente}</strong>
        <p>Monto: Q${p.monto} | Interés: ${p.interes}% | Plazo: ${p.plazo} meses</p>
        <p>Total: Q${p.totalPagar} | Cuota: Q${p.cuotaMensual} | Pendiente: Q${p.saldoPendiente}</p>
        <p>📅 ${p.fecha}</p>
        <button onclick="abrirModal('prestamo',${i})">🗑 Eliminar</button>
      </div>
    `).join('');
  }

  window.eliminarPrestamoConfirm = (i)=>{
    const prestamos = JSON.parse(localStorage.getItem('prestamos'))||[];
    prestamos.splice(i,1);
    localStorage.setItem('prestamos',JSON.stringify(prestamos));
    mostrarHistorialPrestamos();
    actualizarPrestamoPago();
    mostrarPagos();
    mostrarReporte();
  }

  function actualizarPrestamoPago(){
    const prestamos = JSON.parse(localStorage.getItem('prestamos'))||[];
    const prestamoPagoSelect = document.getElementById('prestamoPago');
    prestamoPagoSelect.innerHTML = `<option value="">Selecciona un préstamo</option>`+
      prestamos.map((p,i)=>`<option value="${i}">${p.cliente} | Q${p.saldoPendiente} pendiente</option>`).join('');
  }

  // --- PAGOS ---
  const registrarPagoBtn = document.getElementById('registrarPago');
  const historialPagos = document.getElementById('historialPagos');

  registrarPagoBtn.addEventListener('click',()=>{
    const prestamoIndex = document.getElementById('prestamoPago').value;
    const montoPago = parseFloat(document.getElementById('montoPago').value);
    if(prestamoIndex===""||!montoPago){alert("Completa campos");return;}
    const prestamos = JSON.parse(localStorage.getItem('prestamos'))||[];
    const pagos = JSON.parse(localStorage.getItem('pagos'))||[];
    const prestamo = prestamos[prestamoIndex];
    prestamo.saldoPendiente = Math.max(0,prestamo.saldoPendiente-montoPago).toFixed(2);
    pagos.push({cliente:prestamo.cliente,montoPago,fecha:new Date().toLocaleDateString()});
    localStorage.setItem('prestamos',JSON.stringify(prestamos));
    localStorage.setItem('pagos',JSON.stringify(pagos));
    document.getElementById('pagoForm').reset();
    mostrarHistorialPrestamos();
    actualizarPrestamoPago();
    mostrarPagos();
    mostrarReporte();
  });

  function mostrarPagos(){
    const pagos = JSON.parse(localStorage.getItem('pagos'))||[];
    historialPagos.innerHTML = pagos.map(p=>`
      <div class="historial-item">
        <strong>${p.cliente}</strong> | Pago: Q${p.montoPago} | 📅 ${p.fecha}
      </div>
    `).join('');
  }

  // --- REPORTES ---
  function mostrarReporte(){
    const prestamos = JSON.parse(localStorage.getItem('prestamos'))||[];
    const pagos = JSON.parse(localStorage.getItem('pagos'))||[];
    const totalPrestado = prestamos.reduce((acc,p)=>acc+parseFloat(p.monto),0).toFixed(2);
    const totalPendiente = prestamos.reduce((acc,p)=>acc+parseFloat(p.saldoPendiente),0).toFixed(2);
    const totalCobrado = pagos.reduce((acc,p)=>acc+parseFloat(p.montoPago),0).toFixed(2);

    let resumenPorCliente = '';
    const clientes = [...new Set(prestamos.map(p=>p.cliente))];
    clientes.forEach(c=>{
      const prestamosCliente = prestamos.filter(p=>p.cliente===c);
      const pagosCliente = pagos.filter(p=>p.cliente===c);
      const saldo = prestamosCliente.reduce((a,p)=>a+parseFloat(p.saldoPendiente),0);
      const pagado = pagosCliente.reduce((a,p)=>a+parseFloat(p.montoPago),0);
      resumenPorCliente+=`<div class="historial-item"><strong>${c}</strong><p>Saldo pendiente: Q${saldo} | Total pagado: Q${pagado}</p></div>`;
    });

    document.getElementById('reporteResumen').innerHTML=`
      <p>Total Prestado: Q${totalPrestado}</p>
      <p>Total Pendiente: Q${totalPendiente}</p>
      <p>Total Cobrado: Q${totalCobrado}</p>
      <h3>Resumen por Cliente</h3>
      ${resumenPorCliente}
    `;
  }

  // Inicialización
  mostrarClientes();
  mostrarHistorialPrestamos();
  actualizarPrestamoPago();
  mostrarPagos();
  mostrarReporte();
});
