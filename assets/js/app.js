(function () {
    'use strict';

    const KEY_BALANCE = 'alke_balance';
    const KEY_TRANSACTIONS = 'alke_transactions';
    const KEY_CONTACTS = 'alke_contacts';
    const KEY_USER = 'alke_user';

    const DEFAULT_CONTACTS = [];

    function formatCurrency(v) {
        const n = Number(v) || 0;
        return '$' + n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function getBalance() {
        return parseFloat(localStorage.getItem(KEY_BALANCE) || '0');
    }
    function setBalance(v) {
        localStorage.setItem(KEY_BALANCE, Number(v).toFixed(2));
        updateBalanceDisplay();
    }

    function getTransactions() {
        try { return JSON.parse(localStorage.getItem(KEY_TRANSACTIONS) || '[]'); }
        catch (e) { return []; }
    }
    function saveTransactions(arr) { localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(arr)); }

    function getContacts() {
        try { const c = JSON.parse(localStorage.getItem(KEY_CONTACTS)); return c && c.length ? c : DEFAULT_CONTACTS.slice(); }
        catch (e) { return DEFAULT_CONTACTS.slice(); }
    }
    function saveContacts(list) { localStorage.setItem(KEY_CONTACTS, JSON.stringify(list)); }

    function addTransaction(tx) {
        const arr = getTransactions();
        arr.unshift(tx); // más reciente al inicio
        saveTransactions(arr);
        renderTransactions();
    }

    function updateBalanceDisplay() {
        const el = document.getElementById('saldoMostrar');
        if (el) el.textContent = formatCurrency(getBalance());
        renderLastTransaction();
    }

    function renderLastTransaction() {
        const body = document.getElementById('tablaUltimoMovimientoBody');
        if (!body) return;
        const txs = getTransactions();
        body.innerHTML = '';
        if (!txs.length) {
            body.innerHTML = '<tr><td colspan="4" class="text-muted">—</td></tr>';
            return;
        }
        const tx = txs[0];
        let tipoLabel = tx.type;
        if (tx.type === 'deposit') tipoLabel = 'Depósito';
        else if (tx.type === 'send') tipoLabel = 'Envío';
        else tipoLabel = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);

        const fecha = tx.date || '';
        const sign = tx.type === 'deposit' ? '+' : (tx.type === 'send' ? '-' : '');
        const monto = `${sign}${formatCurrency(tx.amount || 0)}`;
        const destino = tx.to || tx.from || '';
        const comentario = tx.desc || '';

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${tipoLabel}</td><td>${fecha}</td><td class="text-end">${monto}</td><td>${destino}</td><td>${comentario}</td>`;
        body.appendChild(tr);
    }

    function renderTransactions() {
        const listEl = document.getElementById('listaTransacciones');
        if (!listEl) return;
        const txs = getTransactions();
        listEl.innerHTML = '';
        if (!txs.length) {
            listEl.innerHTML = '<div class="text-muted">No hay movimientos registrados.</div>';
            return;
        }
        txs.forEach(tx => {
            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
            const left = document.createElement('div');
            left.className = 'ms-2 me-auto';
            const tipoLabel = tx.type === 'deposit' ? 'Depósito' : (tx.type === 'send' ? 'Envío' : tx.type);
            const destinoTxt = tx.to ? ('— a ' + tx.to) : (tx.from ? ('— de ' + tx.from) : '');
            const comentario = tx.desc ? `<div class="small text-muted mt-1">${tx.desc}</div>` : '';
            left.innerHTML = `<div class="fw-bold">${tipoLabel}</div><div class="small text-muted">${tx.date} ${destinoTxt}</div>${comentario}`;
            const right = document.createElement('div');
            const sign = tx.type === 'deposit' ? '+' : (tx.type === 'send' ? '-' : '');
            right.innerHTML = `<div class="amount ${tx.type === 'deposit' ? 'tx-type-deposit' : 'tx-type-send'}">${sign}${formatCurrency(tx.amount)}</div>`;
            item.appendChild(left);
            item.appendChild(right);
            listEl.appendChild(item);
        });
    }

    function populateContactsDatalist() {
        const contacts = getContacts();
        const datalist = $('#listaContactos');
        if (!datalist.length) return;
        datalist.empty();
        contacts.forEach(c => datalist.append(`<option value="${c.name}">`));
    }

    function renderContactsTable() {
        const body = document.getElementById('tablaContactosBody');
        if (!body) return;
        const contacts = getContacts();
        body.innerHTML = '';
        if (!contacts.length) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="4" class="text-muted">No hay contactos registrados.</td>`;
            body.appendChild(tr);
            return;
        }
        contacts.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${c.name}</td><td>${c.id || ''}</td><td>${c.banco || ''}</td><td>${c.tipoCuenta || ''}</td>`;
            tr.addEventListener('click', () => {
                const buscar = document.getElementById('buscarContacto');
                if (buscar) buscar.value = c.name;
                tr.classList.add('table-primary');
                setTimeout(() => tr.classList.remove('table-primary'), 800);
            });
            body.appendChild(tr);
        });
    }

    function filterContactsTable(q) {
        const body = document.getElementById('tablaContactosBody');
        if (!body) return;
        const rows = Array.from(body.querySelectorAll('tr'));
        const term = (q || '').toLowerCase();
        rows.forEach(r => {
            const first = (r.cells && r.cells[0]) ? r.cells[0].textContent.toLowerCase() : '';
            if (first === '') { // fila de 'no hay contactos'
                r.style.display = term ? 'none' : '';
            } else {
                r.style.display = first.indexOf(term) !== -1 ? '' : 'none';
            }
        });
    }

    function applyBootstrapValidation(form) {
        if (!form) return false;
        form.addEventListener('submit', (e) => {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
        return true;
    }

    // HANDLERS
    function handleLogin() {
        const form = document.getElementById('formularioLogin');
        if (!form) return;
        applyBootstrapValidation(form);
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.checkValidity()) return;
            const email = document.getElementById('correo').value.trim();
            const pass = document.getElementById('contrasena').value;
            if ((email === 'user@alke.com' || email === 'user@alke') && pass === 'tallarin123' || (email === 'user@alke.com' && pass === 'password123')) {
                localStorage.setItem(KEY_USER, JSON.stringify({ email: email }));
                if (!localStorage.getItem(KEY_BALANCE)) setBalance(100.00);
                window.location.href = 'menu.html';
            } else {
                const btn = form.querySelector('button[type=submit]');
                const alert = document.createElement('div');
                alert.className = 'alert alert-danger mt-3';
                alert.textContent = 'Credenciales incorrectas (usar user@alke.com / password123)';
                const prev = form.querySelector('.alert'); if (prev) prev.remove();
                form.appendChild(alert);
            }
        });
    }

    function handleDeposit() {
        const form = document.getElementById('formularioDeposito');
        if (!form) return;
        applyBootstrapValidation(form);
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.checkValidity()) return;
            const amount = parseFloat(document.getElementById('montoDeposito').value);
            if (isNaN(amount) || amount <= 0) return;
            const desc = document.getElementById('descDeposito').value.trim();
            const newBal = getBalance() + amount;
            setBalance(newBal);
            addTransaction({ type: 'deposit', amount: amount, date: new Date().toLocaleString(), desc: desc });
            const msg = document.getElementById('msgDeposito');
            if (msg) msg.innerHTML = `<div class="alert alert-success">Depósito de ${formatCurrency(amount)} realizado. Nuevo saldo: ${formatCurrency(newBal)}</div>`;
            $('#msgDeposito .alert').hide().slideDown(300);
            form.reset(); form.classList.remove('was-validated');
        });
    }

    function handleSendMoney() {
        const form = document.getElementById('formularioEnviar');
        if (!form) return;
        applyBootstrapValidation(form);
        populateContactsDatalist();

        const modalForm = document.getElementById('formularioNuevoContacto');
        if (modalForm) {
            applyBootstrapValidation(modalForm);
            modalForm.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!modalForm.checkValidity()) return;
                const nombre = document.getElementById('nuevoNombre').value.trim();
                const apellido = document.getElementById('nuevoApellido').value.trim();
                const rutEl = document.getElementById('nuevoRut');
                const rut = rutEl.value.trim().toUpperCase();
                const banco = document.getElementById('nuevoBanco').value;
                const tipoCuenta = document.getElementById('nuevoTipoCuenta').value;
                const numeroCuenta = document.getElementById('nuevoNumeroCuenta').value.trim();
                const correo = document.getElementById('nuevoCorreo').value.trim();
                // Validación RUT: permitir entre 1 y 8 dígitos antes del guion,
                const rutMatch = /^(\d{1,8})-([\dK])$/.exec(rut);
                let rutOk = false;
                if (rutMatch) {
                    const numero = parseInt(rutMatch[1], 10);
                    // aceptar 0 hasta 29.999.999
                    if (!Number.isNaN(numero) && numero >= 0 && numero <= 29999999) {
                        rutOk = true;
                    }
                }
                if (!rutOk) {
                    rutEl.setCustomValidity('Formato RUT inválido o número fuera de rango (ej: 12345678-K)');
                    modalForm.classList.add('was-validated');
                    return;
                } else {
                    rutEl.setCustomValidity('');
                }

                const contacts = getContacts();
                // Normalizar nombre y apellido (primera letra en mayúscula y el resto en minúscula)
                function capitalizePart(part) {
                    return part.split(/\s+/).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
                }
                const nombreNorm = capitalizePart(nombre);
                const apellidoNorm = capitalizePart(apellido);
                const fullName = `${nombreNorm} ${apellidoNorm}`.trim();
                const id = correo || (fullName.replace(/\s+/g, '').toLowerCase() + '@nuevo.com');

                // Evitar duplicados por RUT o por correo (id)
                const existsRut = contacts.some(c => c.rut && c.rut.toUpperCase() === rut);
                const existsCorreo = correo ? contacts.some(c => c.id && c.id.toLowerCase() === correo.toLowerCase()) : false;
                // eliminar alerta previa si existe
                const prevAlert = document.getElementById('modalErrorNuevoContacto');
                if (prevAlert) prevAlert.remove();
                if (existsRut || existsCorreo) {
                    const alerta = document.createElement('div');
                    alerta.id = 'modalErrorNuevoContacto';
                    alerta.className = 'alert alert-danger';
                    alerta.textContent = existsRut ? 'Ya existe un contacto con ese RUT.' : 'Ya existe un contacto con ese correo.';
                    modalForm.parentNode.insertBefore(alerta, modalForm);
                    return;
                }

                contacts.push({ name: fullName, id: id, rut: rut, banco: banco, tipoCuenta: tipoCuenta, numeroCuenta: numeroCuenta });
                saveContacts(contacts);
                populateContactsDatalist();
                renderContactsTable();

                const modalEl = document.getElementById('modalNuevoContacto');
                const bsModal = (window.bootstrap && window.bootstrap.Modal) ? (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)) : null;
                if (bsModal) bsModal.hide();

                $('#msgEnviar').html(`<div class="alert alert-success">Contacto ${fullName} agregado.</div>`).hide().slideDown(300);
                setTimeout(() => $('#msgEnviar .alert').slideUp(400), 2000);

                modalForm.reset();
                modalForm.classList.remove('was-validated');
                const buscar = document.getElementById('buscarContacto');
                if (buscar) {
                    buscar.value = fullName;
                    filterContactsTable(fullName);
                    const body = document.getElementById('tablaContactosBody');
                    if (body) {
                        const rows = Array.from(body.querySelectorAll('tr'));
                        const match = rows.find(r => (r.cells && r.cells[0] && r.cells[0].textContent.trim() === fullName));
                        if (match) {
                            match.classList.add('table-success');
                            setTimeout(() => match.classList.remove('table-success'), 1200);
                        }
                    }
                }
            });
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.checkValidity()) return;
            const contactRaw = document.getElementById('buscarContacto').value.trim();
            const amount = parseFloat(document.getElementById('montoEnviar').value);
            const desc = document.getElementById('descEnviar').value.trim();
            if (!contactRaw || isNaN(amount) || amount <= 0) return;
            const contacts = getContacts();
            const toName = contactRaw;
            const found = contacts.find(c => (c.name || '').toLowerCase() === toName.toLowerCase());
            const toId = found ? (found.id || (toName.replace(/\s+/g, '').toLowerCase() + '@nuevo.com')) : (toName.replace(/\s+/g, '').toLowerCase() + '@nuevo.com');
            if (getBalance() < amount) {
                $('#msgEnviar').html('<div class="alert alert-danger">Saldo insuficiente.</div>').hide().slideDown(200);
                return;
            }
            const newBal = getBalance() - amount;
            setBalance(newBal);
            addTransaction({ type: 'send', amount: amount, date: new Date().toLocaleString(), to: toName, desc: desc });
            $('#msgEnviar').html(`<div class="alert alert-success">Enviado ${formatCurrency(amount)} a ${toName}. Nuevo saldo: ${formatCurrency(newBal)}</div>`).hide().slideDown(200);
            form.reset(); form.classList.remove('was-validated');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        updateBalanceDisplay();
        renderTransactions();


        if (document.getElementById('formularioLogin')) handleLogin();
        if (document.getElementById('formularioDeposito')) handleDeposit();
        if (document.getElementById('formularioEnviar')) handleSendMoney();

        populateContactsDatalist();
        renderContactsTable();

        const buscar = document.getElementById('buscarContacto');
        if (buscar) {
            buscar.addEventListener('input', function (e) {
                filterContactsTable(e.target.value);
            });
        }

        const logout = document.getElementById('enlaceSalir');
        if (logout) { logout.addEventListener('click', function () { localStorage.removeItem(KEY_USER); localStorage.removeItem(KEY_BALANCE); }); }

    });

})();
