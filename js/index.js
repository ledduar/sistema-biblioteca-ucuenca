
// Creador por:
// Luis González (luis.gonzaleza@ucuenca.edu.ec) 
// Roger Aguirre (roger.aguirre@ucuenca.edu.ec)

const intervalo = 0.5 // segundos
const credenciales = {
    username: "biblioteca@ucuenca.edu.ec",
    password: "biblioteca2020"
}
const campus = "campus central"
const servidor = "http://10.22.114.5"
const reservas = 5


const autenticarUsusario = async (credenciales) => {
    try {
        console.log("autenticarUsusario......")
        const res = await fetch(`${servidor}/booked/Web/Services/index.php/Authentication/Authenticate`, {
            method: "POST",
            body: JSON.stringify(credenciales),
            headers: { "Content-type": "application/json; charset=UTF-8" }
        })
        const data = await res.json()
        localStorage.setItem("sessionToken", data.sessionToken)
        localStorage.setItem("userId", data.userId)
        return data
    } catch (error) {
        console.log(error)
        window.location.reload()
    }
}

// autenticarUsusario(credenciales)

const getCubiculos = async () => {
    try {
        console.log("getCubiculos....")
        // const res = await fetch(`${servidor}/booked/Web/Services/index.php/Resources`, {
        const res = await fetch('../json/cubiculos.json', {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "X-Booked-SessionToken": localStorage.getItem("sessionToken"),
                "X-Booked-UserId": localStorage.getItem("userId")
            }
        })
        res.status === 401 ? window.location.reload() : ''
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Error", error)
        window.location.reload()
    }
}

getCubiculos()

const getReservaciones = async () => {
    try {
        console.log("getReservaciones....")
        // const res = await fetch(`${servidor}/booked/Web/Services/index.php/Reservations`, {
        const res = await fetch('../json/reservaciones.json', {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "X-Booked-SessionToken": localStorage.getItem("sessionToken"),
                "X-Booked-UserId": localStorage.getItem("userId")
            }
        })
        res.status === 401 ? window.location.reload() : ''
        const data = await res.json()
        return data
    } catch (error) {
        console.log(error)
        window.location.reload()
    }
}


const mostrarCubiculos = async () => {
    const data = await getCubiculos()
    let cubiculos = ''
    let index = 0
    data.resources.map(cubiculo => {
        if (cubiculo.location != null && cubiculo.location.toLowerCase().includes(campus.toLowerCase())) {
            ++index
            cubiculos += `
                <li name="name_cubiculo" id="nombre_cubiculo_${cubiculo.name}">${cubiculo.name}</li>
			`;
        }
    });
    document.getElementById('nombres_cubiculos').innerHTML = cubiculos
    return index
}

mostrarCubiculos()

const cambiarFecha = (e) => {
    const date = new Date(e)
    const dia = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado"]
    const mes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    const fecha = `${dia[date.getDay()]} ${date.getDate()} ${mes[date.getMonth()]} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`
    return fecha
}

const mostrarReservaciones = (cubiculo, data_reservaciones) => {
    let reservaciones = ''
    let index = 0
    data_reservaciones.reservations.map(reservacion => {
        if (reservacion.resourceName === cubiculo && index < reservas) {
            ++index
            reservaciones += `
                <tr>
                    <td class="text-center" id="date_start_${index}">${cambiarFecha(reservacion.startDate)}</td>
                    <td class="text-center" id="date_end_${index}">${cambiarFecha(reservacion.endDate)}</td>
                </tr>
        	`
        }
    })

    if (index === 0) {
        reservaciones += `
                <tr>
                    <td class="font-weight-bold text-center cl-libre" >NINGUNA</td>
                    <td class="font-weight-bold text-center cl-libre" >NINGUNA</td>
                </tr>
        	`
    }

    document.getElementById('body_table').innerHTML = reservaciones;
}

const mostrarInfoCubiculos = (cubiculo, data_reservaciones) => {
    let estado = 'LIBRE'
    let _estado = 'OCUPADO'
    let reservacion
    let indice = 0
    for (let index = 0; index < data_reservaciones.reservations.length; index++) {
        reservacion = data_reservaciones.reservations[index]
        if (reservacion.resourceName === `${cubiculo.name}`) {
            ++indice
            // const date = new Date()
            const date = new Date(2022, 06, 08, 17, 00, 00)
            console.log(date)
            const startDate = new Date(reservacion.startDate)
            const endDate = new Date(reservacion.endDate)
            if (startDate.getTime() <= date.getTime() && date.getTime() <= endDate.getTime()) {
                estado = 'OCUPADO'
                _estado = 'LIBRE'
                document.getElementById(`date_start_${indice}`).classList.add(`cl-${estado.toLowerCase()}`, 'font-weight-bold')
                document.getElementById(`date_end_${indice}`).classList.add(`cl-${estado.toLowerCase()}`, 'font-weight-bold')
                break
            } else {
                estado = 'LIBRE'
                _estado = 'OCUPADO'
            }
        }
    }
    let infoCubiculo = `
    <h1>${cubiculo.name}</h1>
    <h2>${cubiculo.location}</h2>
    <div class="div-estado">
        <h3>${estado}</h3>
    </div>
    `
    document.getElementById('info_cubiculo').innerHTML = infoCubiculo
    document.getElementById('hero_area').classList.add(`grad-${estado.toLowerCase()}`)
    document.getElementById('hero_area').classList.remove(`grad-${_estado.toLowerCase()}`)
    document.getElementById('carousel_control_prev').classList.add(`bg-${estado.toLowerCase()}`)
    document.getElementById('carousel_control_prev').classList.remove(`bg-${_estado.toLowerCase()}`)

    return estado
}

const eliminarFondo = () => {
    let data = document.getElementsByName("name_cubiculo")
    for (let index = 0; index < data.length; index++) {
        data[index].removeAttribute('class')
    }
}

const loopCubiculos = async () => {
    const cubiculos = await getCubiculos()
    const total_cubiculos = await mostrarCubiculos()
    let index = 0
    const intervalo_ms = intervalo * 1000
    setInterval(async () => {
        const reservaciones = await getReservaciones()
        index = 0
        eliminarFondo()
        cubiculos.resources.map(cubiculo => {
            if (cubiculo.location != null && cubiculo.location.toLowerCase().includes(campus.toLowerCase())) {
                setTimeout(async () => {
                    mostrarReservaciones(`${cubiculo.name}`, reservaciones)
                    const estado = mostrarInfoCubiculos(cubiculo, reservaciones)
                    document.getElementById(`nombre_cubiculo_${cubiculo.name}`).classList.add(`bg-${estado.toLowerCase()}`)
                }
                    , intervalo_ms * (++index))
            }
        })
    }, intervalo_ms * (total_cubiculos + 2))
}

loopCubiculos()