const eventsController = {
    slugify: (text) => {
        return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    },
    templateItem: (item) => {
        return `
            <tr>
                <td>${item.nome}</td>
                <td>${item.categoria.nome}</td>
                <td>${item.data}</td>
                <td>${item.local}</td>
                <td>${item.vagas_restantes} / ${item.vagas_totais}</td>
                <td class="actions">
                    <a class="btn-sm btn-edit" href="inscritos.html?evento=${item.id}">Ver inscritos</a>
                    <button type="button" class="btn-sm btn-edit">Editar</button>
                    <button type="button" class="btn-sm btn-delete">Excluir</button>
                </td>
            </tr>
        ` 
    },
    list: async () => {
        const eventsList = await supabaseClient.from("eventos").select(`
                *,
                categoria:categorias(*)
            `)
        return eventsList.data;
    },
    mountCategories: async () => {
        const categories = await categoriesController.list()

        const template = categories.map(item => {
            return `<option value="${item.id}">${item.nome}</option>`
        }).join("")

        document.querySelector("#campo-categoria").innerHTML = template
    },
    getFormData: async () => {
        const nome = document.querySelector("#campo-titulo").value
        const categoria_id = document.querySelector("#campo-categoria").value
        const data = document.querySelector("#campo-data").value
        const horario = document.querySelector("#campo-horario").value
        const local = document.querySelector("#campo-local").value
        const endereco = document.querySelector("#campo-endereco").value
        const vagas_totais = document.querySelector("#campo-vagas-totais").value
        const vagas_restantes = document.querySelector("#campo-vagas-restantes").value
        const destaque = document.querySelector("#campo-destaque").checked
        const descricao = document.querySelector("#campo-descricao").value
        const responsavel = document.querySelector("#campo-organizador").value
        const slug = eventsController.slugify(nome)

        return {
            nome,
            categoria_id,
            data,
            horario,
            local,
            endereco,
            vagas_totais,
            vagas_restantes,
            destaque,
            descricao,
            responsavel,
            slug
        }
    },
    bindEventButton: () => {
        document .querySelector("#salvar-evento").addEventListener("click", async () => {
            const data = eventsController.getFormData()
            console.log("data", data)

            const event = await supabaseClient.from("eventos").insert(data).select()
            console.log("event", evento)
            eventsController.populateEventTables()

            
        })
    },
    populateEventTables: async () => {
        document.querySelector("#events").innerHTML = ""
        const events = await eventsController.list()
        
        const template = events.map(item => {
            return eventsController.templateItem(item)
        }).join("")

        document.querySelector("#events").innerHTML = template
    },
    init: async () => {
        eventsController.mountCategories()
        eventsController.bindEventButton()
        eventsController.populateEventTables()
    }
}

document.addEventListener("DOMContentLoaded", eventsController.init)
