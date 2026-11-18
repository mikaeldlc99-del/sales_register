        const API_URL = "http://localhost:3000/api/registros";
        const params = new URLSearchParams(window.location.search);
        const fechaSeleccionada = params.get("fecha");

        window.addEventListener("DOMContentLoaded", async () => {
            if (!fechaSeleccionada) {
                document.getElementById("subtituloFecha").textContent = "No se especificó una fecha.";
                return;
            }

            const [anio, mes, dia] = fechaSeleccionada.split("-");
            document.getElementById("subtituloFecha").textContent = `Fecha del reporte: ${dia}/${mes}/${anio}`;

            try {
                const res = await fetch(`${API_URL}/reporte/${fechaSeleccionada}`);
                const datos = await res.json();
                renderizarReporte(datos);
            } catch (error) {
                document.getElementById("tablaReporte").innerHTML = 
                    `<tr><td colspan="5">Error al conectar con el servidor.</td></tr>`;
            }
        });

        function renderizarReporte(datos) {
            const tbody = document.getElementById("tablaReporte");
            const cards = document.getElementById("cardsResumen");

            if (datos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5">No se encontraron registros en esta fecha.</td></tr>`;
                cards.innerHTML = `<div class="card-stat"><span>Total Registros</span><strong>0</strong></div>`;
                document.getElementById("theadHoras").innerHTML = "";
                document.getElementById("tbodyHoras").innerHTML = "";
                return;
            }

            // 1. Tarjetas superiores
            const conteo = datos.reduce((acc, reg) => {
                acc[reg.estado] = (acc[reg.estado] || 0) + 1;
                return acc;
            }, {});

            cards.innerHTML = `<div class="card-stat"><span>Total del Día</span><strong>${datos.length}</strong></div>` +
                Object.entries(conteo).map(([estado, cant]) => `
                    <div class="card-stat">
                        <span>${estado}</span>
                        <strong>${cant}</strong>
                    </div>
                `).join("");

            // 2. Tabla de detalle
            tbody.innerHTML = datos.map(reg => `
                <tr>
                    <td>${reg.id}</td>
                    <td>${reg.dni}</td>
                    <td>${reg.hora}</td>
                    <td>${reg.estado}</td>
                    <td>${reg.Observaciones || "-"}</td>
                </tr>
            `).join("");

            // 3. Tabla de resumen por hora
            renderizarResumenPorHora(datos);
        }

        function renderizarResumenPorHora(datos) {
            const thead = document.getElementById("theadHoras");
            const tbody = document.getElementById("tbodyHoras");

            const estados = [...new Set(datos.map(r => r.estado))];
            const porHora = {};
            const totalesEstado = {};
            estados.forEach(est => totalesEstado[est] = 0);

            datos.forEach(reg => {
                // Convertir hora (ej. "09:33 PM") a formato 24h ("21")
                const partes = reg.hora.split(":");
                let horaNum = parseInt(partes[0], 10);

                if (reg.hora.includes("PM") && horaNum !== 12) {
                    horaNum += 12;
                } else if (reg.hora.includes("AM") && horaNum === 12) {
                    horaNum = 0;
                }

                const hora24 = String(horaNum).padStart(2, "0");

                if (!porHora[hora24]) {
                    porHora[hora24] = { total: 0 };
                    estados.forEach(est => porHora[hora24][est] = 0);
                }

                porHora[hora24][reg.estado]++;
                porHora[hora24].total++;
                totalesEstado[reg.estado]++;
            });

            thead.innerHTML = `
                <tr>
                    <th>Hora</th>
                    ${estados.map(est => `<th>${est}</th>`).join("")}
                    <th>Total</th>
                </tr>
            `;

            const horasOrdenadas = Object.keys(porHora).sort();
            let filasHTML = horasOrdenadas.map(h => `
                <tr>
                    <td><strong>${h}:00</strong></td>
                    ${estados.map(est => `<td>${porHora[h][est] || "-"}</td>`).join("")}
                    <td><strong>${porHora[h].total}</strong></td>
                </tr>
            `).join("");

            filasHTML += `
                <tr style="background-color: #1e293b; font-weight: bold;">
                    <td>Total del Día</td>
                    ${estados.map(est => `<td>${totalesEstado[est]}</td>`).join("")}
                    <td style="color: #4ade80;">${datos.length}</td>
                </tr>
            `;

            tbody.innerHTML = filasHTML;
        }
