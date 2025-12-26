document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('overlay');
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('page-title');

    // ===== SUBMENU (RESTAURADO – NÃO REMOVER) =====
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    const submenuParents = document.querySelectorAll('.has-submenu');

    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = toggle.closest('.has-submenu');

            submenuParents.forEach(p => {
                if (p !== parent) p.classList.remove('open');
            });

            parent.classList.toggle('open');
        });
    });

    let requisicoes = JSON.parse(localStorage.getItem('requisicoes')) || [];
    let setorAtual = localStorage.getItem('setorAtual') || 'Azul';
    let contextoSetor = null;


    // ===== CAMPOS DO FORMULÁRIO (EXAMES) =====
    const tipoExameSelect = document.getElementById('tipo-exame');
    const subtipoContainer = document.getElementById('subtipo-container');
    const subtipoSelect = document.getElementById('subtipo-exame');

    const contrasteToggle = document.getElementById('contraste-toggle');
    const contrasteContainer = document.getElementById('contraste-container');
    const funcaoRenalContainer = document.getElementById('funcao-renal-container');

    const urgenteToggle = document.getElementById('urgente-toggle');



    // ===== FUNÇÃO AUXILIAR PARA FORMATAR DATA/HORA =====
    const formatarData = (iso) => {
    if (!iso) return '';

    const data = new Date(iso);

    return data.toLocaleDateString('pt-BR') + ' ' +
           data.toLocaleTimeString('pt-BR', {
               hour: '2-digit',
               minute: '2-digit'
           });
    };




    // ===== FUNÇÃO AUXILIAR – CONTADOR DE LAUDOS =====
const atualizarContadorLaudos = (quantidade) => {
    const contador = document.getElementById('contador-laudos');
    if (!contador) return;

    contador.textContent =
        quantidade === 1
            ? '1 laudo encontrado'
            : `${quantidade} laudos encontrados`;
};




    // ===== ATUALIZAR SETOR UI =====

    const atualizarSetorUI = () => {
        document.getElementById('setor-nome-solicitar').textContent =
            `Setor: ${setorAtual}`;
        document.getElementById('setor-nome-pendentes').textContent =
            `Setor: ${setorAtual}`;
        document.getElementById('setor-selecionado-solicitar').value =
            setorAtual;
    };


      // ===== MEDICO SOLICITANTE - MUDAR QUANDO SISTEMA DE LOGIN ESTIVER ON =====

        // ===== (TEMPORÁRIO) =====
        const MEDICO_SOLICITANTE_PADRAO = 'Matheus';


    // ===== PENDENTES =====
    const renderRequisicoes = () => {
        const container = document.getElementById('requisicoes-container');
        container.innerHTML = '';

        const lista = requisicoes.filter(
            r =>
                r.setor === setorAtual &&
                r.status === 'solicitado'
        );

        if (!lista.length) {
            container.innerHTML =
                '<p class="empty-message">Nenhuma pendente</p>';
            return;
        }

        lista.forEach((r, i) => {

    const status = r.status || 'solicitado';

    const statusLabel =
    status === 'solicitado'
        ? '<span class="badge-status badge-solicitado">Solicitado</span>'
        : status === 'em_exame'
        ? '<span class="badge-status badge-em-exame">Em exame</span>'
        : status === 'cancelado'
        ? '<span class="badge-status badge-cancelado">Cancelado</span>'
        : '<span class="badge-status badge-laudo">Laudo emitido</span>';
            

            

    container.innerHTML += `
        <div class="requisicao-card">
            <div>
                <p><strong>Paciente:</strong> ${r.paciente}</p>
                <p>
                    <strong>Tipo:</strong>
                    ${r.tipo}${r.subtipo ? ' - ' + r.subtipo : ''}
                    ${
                          r.tipo === 'TC'
                          ? (
                                r.contraste
                                    ? ' <span class="contraste">com contraste</span>'
                                    : ' sem contraste'
                            )
                            : ''
                    }
                </p>

                <p><strong>Solicitante:</strong> Dr. ${r.solicitante || '---'}</p>

                <p class="data-info">
                    <strong>Solicitado em:</strong>
                    ${formatarData(r.dataSolicitacao)}
                    ${r.urgente ? ' - <span class="urgente">URGENTE</span>' : ''}
                </p>

                ${
                    r.dataInicioExame
                        ? `<p class="data-info">
                            <strong>Em exame desde:</strong>
                            ${formatarData(r.dataInicioExame)}
                           </p>`
                        : ''
                }

                ${statusLabel}
            </div>
           
        </div>`;
});


    };


    // ===== MINHAS REQUISIÇÕES =====
const renderMinhasRequisicoes = () => {
    const container = document.getElementById('minhas-requisicoes-container');
    container.innerHTML = '';

    const minhas = requisicoes.filter(
        r => r.solicitante === MEDICO_SOLICITANTE_PADRAO
    );

    if (!minhas.length) {
        container.innerHTML =
            '<p class="empty-message">Você ainda não possui requisições.</p>';
        return;
    }

    minhas.forEach((r, i) => {
        container.innerHTML += `
            <div class="requisicao-card">
                <div>
                    <p><strong>Paciente:</strong> ${r.paciente}</p>

                    <p><strong>Tipo:</strong>
                        ${r.tipo}${r.subtipo ? ' - ' + r.subtipo : ''}
                        ${
                            r.tipo === 'TC'
                                ? (
                                    r.contraste
                                        ? ' <span class="contraste">com contraste</span>'
                                        : ' sem contraste'
                                  )
                                : ''
                        }
                    </p>

                    <p class="data-info">
                        <strong>Solicitado em:</strong>
                        ${formatarData(r.dataSolicitacao)}
                        ${r.urgente ? ' - <span class="urgente">URGENTE</span>' : ''}
                    </p>

                    <span class="badge-status badge-${r.status}">
                        ${r.status.replace('_', ' ')}
                    </span>
                </div>

                <div class="acoes-minhas">
                    <button class="btn-editar" disabled>Editar</button>
                    <button class="btn-excluir" disabled>Excluir</button>
                </div>
            </div>
        `;
    });
};


// ===== EXAMES A REALIZAR (RADIOLOGIA) =====
const renderExamesRealizar = () => {
    const container = document.getElementById('exames-realizar-container');
    container.innerHTML = '';

    requisicoes.forEach((r, index) => {

        if (r.status !== 'solicitado') return;

        container.innerHTML += `
            <div class="requisicao-card">
                <div>
                    <p><strong>Paciente:</strong> ${r.paciente}</p>

                    <p><strong>Tipo:</strong>
                        ${r.tipo}${r.subtipo ? ' - ' + r.subtipo : ''}
                        ${
                            r.tipo === 'TC'
                                ? (
                                    r.contraste
                                        ? ' <span class="contraste">com contraste</span>'
                                        : ' sem contraste'
                                  )
                                : ''
                        }
                    </p>

                    <p><strong>Setor:</strong> ${r.setor}</p>

                    <p class="data-info">
                        <strong>Solicitado em:</strong>
                        ${formatarData(r.dataSolicitacao)}
                        ${r.urgente ? ' - <span class="urgente">URGENTE</span>' : ''}
                    </p>
                </div>

                <div class="acoes-radiologia">
                    <button onclick="abrirFormLaudo(${index})">Realizar</button>
                    <button disabled>Editar</button>
                    <button onclick="cancelarExame(${index})">Cancelar</button>
                </div>
            </div>
        `;
    });

    if (!container.innerHTML) {
        container.innerHTML =
            '<p class="empty-message">Nenhum exame disponível.</p>';
    }
};

// FIM - EXAMES A REALIZAR (RADIOLOGIA)



// ===== VISUALIZAR LAUDOS (TODOS) =====

const renderLaudos = () => {
    const container = document.getElementById('laudos-container');
    container.innerHTML = '';

    const laudos = aplicarFiltrosLaudos(
    requisicoes.filter(r => r.status === 'laudo_emitido')
);

        atualizarContadorLaudos(laudos.length);


    if (!laudos.length) {
        container.innerHTML =
            '<p class="empty-message">Nenhum laudo disponível.</p>';
        return;
    }

    laudos.forEach((r, index) => {
        container.innerHTML += `
            <div class="requisicao-card laudo-card">

                <div class="laudo-linha">
                    <span><strong>Paciente:</strong> ${r.paciente}</span>
                    <span>
                        <strong>${r.tipo}</strong>${r.subtipo ? ' - ' + r.subtipo : ''}
                    </span>
                    <span><strong>Setor:</strong> ${r.setor}</span>
                    <span><strong>Laudo em:</strong> ${formatarData(r.dataLaudo)}</span>
                </div>

                <div class="acoes-laudo">
                    <a href="Laudos/${r.laudo.nome}" target="_blank" class="btn-laudo">
                        Abrir
                    </a>
                    <a href="Laudos/${r.laudo.nome}" download class="btn-laudo secondary">
                        Baixar
                    </a>
                    ${
                        r.assinatura
                            ? `<span class="laudo-assinado">✔ Assinado</span>`
                            : ''
                    }
                </div>

            </div>
        `;
    });
};




// FIM - VISUALIZAR LAUDOS (TODOS)


// ===== MEUS LAUDOS (DO SOLICITANTE) =====

const renderMeusLaudos = () => {
    const container = document.getElementById('meus-laudos-container');
    container.innerHTML = '';

    const meus = aplicarFiltrosLaudos(
    requisicoes.filter(
        r => r.status === 'laudo_emitido' &&
             r.solicitante === MEDICO_SOLICITANTE_PADRAO
            )
        );


        atualizarContadorLaudos(meus.length);


    if (!meus.length) {
        container.innerHTML =
            '<p class="empty-message">Você ainda não possui laudos.</p>';
        return;
    }

    meus.forEach((r, index) => {
        container.innerHTML += `
            <div class="requisicao-card laudo-card">

                <div class="laudo-linha">
                    <span><strong>Paciente:</strong> ${r.paciente}</span>

                    <span>
                        <strong>${r.tipo}</strong>${r.subtipo ? ' - ' + r.subtipo : ''}
                    </span>

                    <span><strong>Setor:</strong> ${r.setor}</span>

                    <span class="data-info">
                        <strong>Laudo em:</strong> ${formatarData(r.dataLaudo)}
                    </span>
                </div>

                <div class="acoes-laudo">
                    <a href="Laudos/${r.laudo.nome}" target="_blank" class="btn-laudo">
                        Abrir
                    </a>

                    <a href="Laudos/${r.laudo.nome}" download class="btn-laudo secondary">
                        Baixar
                    </a>

                    ${
                        !r.assinatura
                            ? `<button class="btn-laudo assinar" onclick="assinarLaudo(${index})">
                                   Assinar
                               </button>`
                            : `<span class="laudo-assinado">✔ Assinado</span>`
                    }
                </div>

            </div>
        `;
    });
};




// FIM - MEUS LAUDOS (DO SOLICITANTE)


// ===== FILTRO DE BUSCA =====

const aplicarFiltrosLaudos = (lista) => {
    const paciente = document.getElementById('filtro-paciente')?.value.toLowerCase() || '';
    const tipo = document.getElementById('filtro-tipo')?.value.toLowerCase() || '';
    const setor = document.getElementById('filtro-setor')?.value || '';
    const data = document.getElementById('filtro-data')?.value || '';

    return lista.filter(r => {
        const matchPaciente = r.paciente.toLowerCase().includes(paciente);
        const matchTipo = `${r.tipo} ${r.subtipo || ''}`.toLowerCase().includes(tipo);
        const matchSetor = !setor || r.setor === setor;
        const matchData = !data || r.dataLaudo?.startsWith(data);

        return matchPaciente && matchTipo && matchSetor && matchData;
    });
};


// FIM - FILTRO DE BUSCA



// ===== ATUALIZA AO DIGITAR - FILTRO DE BUSCA =====

[
    'filtro-paciente',
    'filtro-tipo',
    'filtro-setor',
    'filtro-data'
].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', () => {
            if (location.hash === '#visualizar-laudos') renderLaudos();
            if (location.hash === '#meus-laudos') renderMeusLaudos();
        });
    }
});

document.getElementById('limpar-filtros')?.addEventListener('click', () => {
    document.getElementById('filtro-paciente').value = '';
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-setor').value = '';
    document.getElementById('filtro-data').value = '';

    if (location.hash === '#visualizar-laudos') renderLaudos();
    if (location.hash === '#meus-laudos') renderMeusLaudos();
});



// FIM - ATUALIZA AO DIGITAR - FILTRO DE BUSCA













    // ===== NAVEGAÇÃO =====
    const showPage = (pageId) => {

        const filtros = document.getElementById('laudos-filtros-wrapper');

            if (filtros) {
                if (pageId === 'visualizar-laudos' || pageId === 'meus-laudos') {
                    filtros.style.display = 'block';
                } else {
                    filtros.style.display = 'none';
                }
            }


            if (filtros && pageId !== 'visualizar-laudos' && pageId !== 'meus-laudos') {
                document.getElementById('filtro-paciente').value = '';
                document.getElementById('filtro-tipo').value = '';
                document.getElementById('filtro-setor').value = '';
                document.getElementById('filtro-data').value = '';
            }






        pages.forEach(p => p.classList.remove('active'));
        const page = document.getElementById(pageId);
        if (page) page.classList.add('active');

        const titles = {
            painel: 'Painel',
            'solicitar-exame': 'Solicitar Exame',
            pendentes: 'Requisições por setor',
            'minhas-requisicoes': 'Minhas requisições',
            'exames-realizar': 'Exames a realizar',
            laudos: 'Laudos',
            'visualizar-laudos': 'Visualizar laudos',
            'meus-laudos': 'Meus laudos',
            estatisticas: 'Estatísticas',
            configuracoes: 'Configurações',
            sair: 'Sair'
        };
        pageTitle.textContent = titles[pageId] || 'Painel';

        if ([

            'solicitar-exame',
            'pendentes',
            'minhas-requisicoes',
            'exames-realizar',
            'visualizar-laudos',
            'meus-laudos'
        
        ].includes(pageId)) {
            atualizarSetorUI();

            if (pageId === 'pendentes') renderRequisicoes();
            if (pageId === 'minhas-requisicoes') renderMinhasRequisicoes();
            if (pageId === 'exames-realizar') { renderExamesRealizar(); }
            if (pageId === 'visualizar-laudos') renderLaudos();
            if (pageId === 'meus-laudos') renderMeusLaudos();

            }
    };

    window.addEventListener('hashchange', () => {
        showPage(location.hash.slice(1) || 'painel');
    });

    navLinks.forEach(link => {
        link.onclick = e => {
            e.preventDefault();
            location.hash = link.getAttribute('href');
        };
    });

    showPage(location.hash.slice(1) || 'painel');

    // ===== SIDEBAR =====
    toggleBtn.onclick = () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    };

    mobileMenuBtn.onclick = () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    };

    overlay.onclick = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    };

    // ===== MODAL GLOBAL DE SETOR =====
    const setorModal = document.getElementById('setor-selector-panel');
    const setorOverlay = document.getElementById('setor-modal-overlay');
    const fecharSetorBtn = document.getElementById('fechar-setor-panel');
    const botoesSetor = setorModal.querySelectorAll('.btn-setor');

    const abrirModalSetor = (contexto) => {
        contextoSetor = contexto;
        setorModal.style.display = 'block';
        setorOverlay.classList.add('active');
    };

    const fecharModalSetor = () => {
        setorModal.style.display = 'none';
        setorOverlay.classList.remove('active');
    };

    fecharSetorBtn.onclick = fecharModalSetor;
    setorOverlay.onclick = fecharModalSetor;

    document.getElementById('alterar-setor-solicitar').onclick =
        () => abrirModalSetor('solicitar');

    document.getElementById('alterar-setor-pendentes').onclick =
        () => abrirModalSetor('pendentes');

    botoesSetor.forEach(btn => {
        btn.onclick = () => {
            setorAtual = btn.dataset.setor;
            localStorage.setItem('setorAtual', setorAtual);
            atualizarSetorUI();
            if (contextoSetor === 'pendentes') renderRequisicoes();
            fecharModalSetor();
        };
    });

    

    // ===== FORM SOLICITAÇÃO =====
    document.getElementById('form-solicitacao').onsubmit = e => {
        e.preventDefault();
        requisicoes.push({
            paciente: paciente.value,
            tipo: tipoExameSelect.value,
            subtipo: subtipoSelect.value || null,
            contraste: contrasteToggle.checked,
            funcaoRenal: contrasteToggle.checked
                ? {
                    ureia: document.getElementById('ureia').value,
                    creatinina: document.getElementById('creatinina').value
                }
                : null,
            setor: setorAtual,
            solicitante: MEDICO_SOLICITANTE_PADRAO,
            urgente: urgenteToggle.checked,
            status: 'solicitado',
            dataSolicitacao: new Date().toISOString(),
            dataInicioExame: null,
            dataLaudo: null,
            laudo: null
        });


        localStorage.setItem('requisicoes', JSON.stringify(requisicoes));
        alert('Exame solicitado!');
    };




    // ===== SUBTIPOS CADASTRADOS =====

    if (tipoExameSelect) {
    
    const subtiposUltrassom = [
        'Abdome total',
        'Abdome superior',
        'Aparelho urinário',
        'Próstata via abdominal',
        'Pélvico (feminino)',
        'Cervical',
        'Partes moles',
        'Transvaginal',
        'Tórax',
        'Obstétrico',
        'Doppler venoso de membro',
        'Doppler de carótidas',
        'Outro'
    ];

    const subtiposTC = [
        'Crânio',
        'Tórax',
        'Abdome total',
        'Abdome superior',
        'Abdome inferior',
        'Coluna cervical',
        'Coluna torácica',
        'Coluna lombossacra',
        'Outro'
    ];


    // ===== CONTROLE DE SUBTIPO DE EXAME =====
    tipoExameSelect.addEventListener('change', () => {
    subtipoSelect.innerHTML = '<option value="">Selecione</option>';

    let subtipos = [];

    if (tipoExameSelect.value === 'Ultrassonografia') {
        subtipos = subtiposUltrassom;
    } else if (tipoExameSelect.value === 'TC') {
        subtipos = subtiposTC;
    }

    if (subtipos.length > 0) {
        subtipos.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            subtipoSelect.appendChild(opt);
        });
        subtipoContainer.style.display = 'block';
        subtipoSelect.required = true;
    } else {
        subtipoContainer.style.display = 'none';
        subtipoSelect.required = false;
    }
    });


    // ===== TOGGLE DE CONTRASTE PARA TC =====

    const contrasteToggle = document.getElementById('contraste-toggle');
    const contrasteContainer = document.getElementById('contraste-container');
    const funcaoRenalContainer = document.getElementById('funcao-renal-container');

    tipoExameSelect.addEventListener('change', () => {
        contrasteToggle.checked = false;
        funcaoRenalContainer.style.display = 'none';

        if (tipoExameSelect.value === 'TC') {
            contrasteContainer.style.display = 'block';
        } else {
            contrasteContainer.style.display = 'none';
        }
    });

    contrasteToggle.addEventListener('change', () => {
        funcaoRenalContainer.style.display =
            contrasteToggle.checked ? 'block' : 'none';
    });

    

    // ===== TOGGLE URGENTE =====

    const urgenteToggle = document.getElementById('urgente-toggle');

    }

  


// FIM DE EXAMES A REALIZAR


// ===== FUNCAO CANCELAR =====

window.cancelarExame = (i) => {
    if (!confirm('Deseja cancelar este exame?')) return;

    requisicoes[i].status = 'cancelado';
    localStorage.setItem('requisicoes', JSON.stringify(requisicoes));

    renderExamesRealizar();
    renderRequisicoes();
    renderMinhasRequisicoes();
};


// FIM FUNCAO CANCELAR


// ===== FUNCAO EM EXAME =====

    window.abrirFormLaudo = (i) => {
    requisicoes[i].status = 'em_exame';
    requisicoes[i].dataInicioExame = new Date().toISOString();

    localStorage.setItem('requisicoes', JSON.stringify(requisicoes));

        renderExamesRealizar();
        renderRequisicoes();
        renderMinhasRequisicoes();

    document.getElementById('requisicao-id').value = i;
    document.getElementById('realizar-exame-section').style.display = 'block';
    location.hash = 'realizar-exame-section';
    };


    document.getElementById('cancelar-laudo').onclick = () => {
        document.getElementById('realizar-exame-section').style.display = 'none';
        location.hash = 'pendentes';
    };

    // FIM - FUNCAO EM EXAME


// ===== ASSINAR LAUDO =====
window.assinarLaudo = (index) => {
    if (!confirm('Deseja assinar este laudo?')) return;

    requisicoes[index].assinatura = {
        medico: MEDICO_SOLICITANTE_PADRAO,
        data: new Date().toISOString()
    };

    localStorage.setItem('requisicoes', JSON.stringify(requisicoes));

    // Re-renderiza as telas de laudos
    renderLaudos();
    renderMeusLaudos();

    alert('Laudo assinado com sucesso!');
};

// FIM - ASSINAR LAUDO

    // ===== ENVIO DO LAUDO =====
document.getElementById('form-laudo').onsubmit = async (e) => {
    e.preventDefault();

    const index = parseInt(document.getElementById('requisicao-id').value);
    const paciente = requisicoes[index].paciente;
    const setor = requisicoes[index].setor;
    const tipoExame = requisicoes[index].tipo;
    // Se ainda não existir prontuário no sistema
    const prontuario = requisicoes[index].prontuario?.trim() || 'semprontuario';
    

    const arquivo = document.getElementById('laudo-arquivo').files[0];
    const comentarios = document.getElementById('comentarios').value;

    if (!arquivo || arquivo.type !== 'application/pdf') {
        alert('Selecione um arquivo PDF válido.');
        return;
    }

    const formData = new FormData();
    formData.append('laudo', arquivo);
    formData.append('paciente', requisicoes[index].paciente);
    formData.append('prontuario', requisicoes[index].prontuario || 'sem_prontuario');
    formData.append('setor', requisicoes[index].setor);
    formData.append('tipo', requisicoes[index].tipo);

    try {
        const response = await fetch('upload-laudo.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!result.sucesso) {
            alert('Erro ao salvar laudo: ' + result.erro);
            return;
        }

        // Atualiza dados locais
        requisicoes[index].laudo = {
            nome: result.arquivo,
            comentarios
        };
        requisicoes[index].status = 'laudo_emitido';
        requisicoes[index].dataLaudo = new Date().toISOString();

        localStorage.setItem('requisicoes', JSON.stringify(requisicoes));

        document.getElementById('realizar-exame-section').style.display = 'none';
        document.getElementById('form-laudo').reset();

        renderRequisicoes();
        location.hash = 'pendentes';

        alert('Laudo salvo com sucesso!');

    } catch (err) {
        alert('Erro de comunicação com o servidor.');
        console.error(err);
    }
};



});
