const eventsController = {
    slugify: (text) => {
        return text
            .toString()
            .normalize('NFD') // Separa os acentos das letras
            .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
            .toLowerCase() // Converte para minúsculas
            .trim() // Remove espaços do início e do fim
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .replace(/[\s_-]+/g, '-') // Substitui espaços e underscores por hífens
            .replace(/^-+|-+$/g, ''); // Remove hífens do começo e do fim
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
    validate: (element, value, size) => {
        const selectError = document.querySelector(`#campo-${element} + .error`);
        if(value.length < size) {
            selectError.classList.add("show");
            return false;
        }
        selectError.classList.remove("show");
        return true;
    },
    getFormData: () => {
        const nome = document.querySelector("#campo-titulo").value;
        if(!eventsController.validate("titulo", nome, 3)){
            return;
        }

        const categoria_id = document.querySelector("#campo-categoria").value;

        const data = document.querySelector("#campo-data").value;
        if(!eventsController.validate("data", data, 3)){
            return;
        }

        const horario = document.querySelector("#campo-horario").value;
        if(!eventsController.validate("horario", horario, 3)){
            return;
        }

        const local = document.querySelector("#campo-local").value;
        if(!eventsController.validate("local", local, 3)){
            return;
        }

        const endereco = document.querySelector("#campo-endereco").value;
        if(!eventsController.validate("endereco", endereco, 3)){
            return;
        }

        const vagas_totais = document.querySelector("#campo-vagas-totais").value;
        if(!eventsController.validate("vagas-totais", vagas_totais, 3)){
            return;
        }

        const vagas_restantes = document.querySelector("#campo-vagas-restantes").value;
        if(!eventsController.validate("vagas-restantes", vagas_restantes, 3)){
            return;
        }

        const destaque = document.querySelector("#campo-destaque").checked;

        const descricao = document.querySelector("#campo-descricao").value;
        if(!eventsController.validate("descricao", descricao, 3)){
            return;
        }

        const responsavel = document.querySelector("#campo-organizador").value;
        if(!eventsController.validate("organizador", responsavel, 3)){
            return;
        }

        const slug = eventsController.slugify(nome);

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
        document.querySelector("#salvar-evento").addEventListener("click", async () => {
            const data = eventsController.getFormData()
            if(!data){
                return;
            }
            console.log("data", data)

            const event = await supabaseClient.from("eventos").insert(data).select()
            console.log("event", event)
            eventsController.populateEventTable()

            if(event.status === 200) {
                alert(`O evento foi inserido com sucesso!`)
            } else {
                alert(`Houve um erro ao inserir o evento`)
            }
        })
    },
    populateEventTable: async () => {
        document.querySelector("#events").innerHTML = ""
        const events = await eventsController.list()
        
        const template = events.map(item => {
            return eventsController.templateItem(item)
        }).join("")

        document.querySelector("#events").innerHTML = template

        ([...document.querySelectorAll(".btn-delete")].map(btn => {
            btn.addEventListener("click", function() {
                await supabaseClient.from("eventos").delete().eq("id", id)
                eventsController.populateEventTable()
                
            })
        }))
    },
    init: async () => {
        eventsController.mountCategories()
        eventsController.bindEventButton()
        eventsController.populateEventTable()
    }
}

document.addEventListener("DOMContentLoaded", eventsController.init)