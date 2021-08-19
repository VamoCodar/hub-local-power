
import chartOptionsGAcumulada from "./components/chartOptionsGAcumulada.js";
import chartOptionsGeracao from "./components/chartOptionsGeracao.js";
import chartOptionsRetorno from "./components/chartOptionsRetorno.js";
import * as script from "./script.js"

moment.locale('pt-br');
Vue.config.ignoredElements = ['ion-icon']
Vue.use(VueApexCharts);
Vue.component('apexchart', VueApexCharts)

const vm = new Vue({  // 🟢  Instancia   
	el: '#app',
	data: {
		projetos: [],
		geracoes: [],
		projetoAtual: { fase_do_projeto: 0, },
		periodoSelected: "ultimos_12_meses",
		periodoTotal: 12,
		anexos: [],

		//data dos graficos
		geracaoPeriodo: { Previsto: "", Realizado: "", },
		geracaoAcumulada: { Previsto: "", Realizado: "", },
		retornoInvestimento: {},

		//series Apex charts ===
		seriesGeracaoPeriodo: [{
			name: 'Previsto',
			type: 'column',
			data: [0, 0],

		}, {
			name: 'Realizado',
			type: 'line',
			data: [0, 0],

		}],

		seriesGeracaoAcumulada: [{ data: [0, 0] }],
		seriesRetornoInvestimento: [{ data: [0, 0] }],


		//APEXCHART OPTIONS
		chartOptionsGAcumulada,
		chartOptionsGeracao,
		chartOptionsRetorno,
	},



	watch: {	// 👀 WATCH
		periodoSelected(value) {
			this.fetchGeracaoPeriodo(this.projetoAtual.id, value) //quando select muda faz o fetch com o filtro 
		},
	},


	computed: {	// ⌨️ COMPUTED
		//
	},

	filters: { // 🤿 FILTERS
		formatDDMM(valor) {
			let valorFiltrado = valor
			valorFiltrado !== null ? valorFiltrado = moment(valorFiltrado).format("DD/MM") : valorFiltrado = "-"
			return valorFiltrado

		},
		formatMMAAAA(valor) {
			return moment(valor).format("MMM Y")

		},
		formatValuePTBR(valor) {
			let valorNumber = parseFloat(valor)
			return valorNumber.toLocaleString("pt-BR", {
				style: "currency",
				currency: "BRL"
			});
		}

	},


	methods: {	//🧙‍♂️ METODOS
		// FETCHS =========================
		fetchProjetos() {
			
			fetch("/api/projetos")
				.then(r => r.json())
				.then(r => {
					this.projetos = r
					this.DeclararProjetoAtual(0) //1° projeto index 0
				})
				.catch(e => alert(e))
		},

		fetchGeracoes() {
			fetch("/api/geracoes")
				.then(r => r.json())
				.then(r => this.geracoes = r)
				.catch(e => alert(e))
		},

		fetchGeracaoAcumulada(projeto) {
			fetch(`/api/projetos/${projeto}/geracao_acumulada`)
				.then(r => r.json())
				.then(r => {
					this.geracaoAcumulada = r
					let previsto = parseInt(this.geracaoAcumulada.Previsto)
					let realizado = parseInt(this.geracaoAcumulada.Realizado)
					this.seriesGeracaoAcumulada = [{ data: [previsto, realizado] }]
				})
				.catch(e => alert(e))
		},
		fetchRetornoInvestimento(projeto) {
			fetch(`/api/projetos/${projeto}/retorno_do_investimento/`)
				.then(r => r.json())
				.then(r => {
					this.retornoInvestimento = r
					console.log(this.retornoInvestimento["Energia Solar"]);
					this.seriesRetornoInvestimento = [{
						data: [this.retornoInvestimento["CDI"], this.retornoInvestimento["Energia Solar"]]
					}]

				}).catch(e => alert(e))
		},

		fetchGeracaoPeriodo(projeto, filtro) { ///// ?filtro=ultimos_12_meses
			fetch(`/api/projetos/${projeto}/geracao/?filtro=${filtro}`)
				.then(r => r.json())
				.then(r => {
					this.seriesGeracaoPeriodo = r

					let previsto = this.seriesGeracaoPeriodo.Previsto //atribuo
					let previstoValores = Object.keys(previsto).map(key => previsto[key]) //mapeio somente os VALUES para uma nova array
					// let previstoMeses = Object.keys(previsto) //PEGO OS MESES

					let realizado = this.seriesGeracaoPeriodo.Realizado //atribuo
					let realizadoValores = Object.keys(realizado).map(key => realizado[key]) //MAPEIO OS VALORES
					let realizadoMeses = Object.keys(realizado).map(key => moment(key).format("MMM")) //MAPEIO OS MESES


					this.seriesGeracaoPeriodo =
						[{ data: previstoValores }, { data: realizadoValores }] //add no grafico


					this.$children[0].chart.updateOptions({ //update nas categorias
						xaxis: {
							categories: realizadoMeses,
						},
					})

				})
				.catch(e => alert(e))
		},
		//========================= 

		DeclararProjetoAtual(index) {
			this.projetoAtual = this.projetos[index]
			this.fetchGeracaoAcumulada(this.projetoAtual.id)
			this.fetchRetornoInvestimento(this.projetoAtual.id)
			this.fetchGeracaoPeriodo(this.projetoAtual.id, this.periodoSelected)
			this.verificaQuantidadeDeAnexos()

		},

		verificaFase(valor) {
			return this.projetoAtual.fase_do_projeto >= valor
		},

		verificaQuantidadeDeAnexos() {

			const { url_helioscope, url_proposta_comercial, url_protocolo, url_parecer_acesso_arquivos, url_contrato } = this.projetoAtual //desestruturar
			const array = [url_helioscope, url_proposta_comercial, url_protocolo, url_parecer_acesso_arquivos, url_contrato] //declarar
			this.anexos = array.filter(i => i !== "None") //filtrar se tem ou nao



		}

	},



	// ❤️ HOOKS 

	created() { // 🙌 CREATED
		this.fetchProjetos()
		this.fetchGeracoes()



	},


	updated() { // ♻️ UPDATED
		script.ultimoAtivo()

	},

	mounted() { //🐴 MOUNTED
		document.body.classList.add("dcl")

	},






	delimiters: ["{*", "*}"], //delimitadores pra n conflitar com o django
	// ================================================================       🌈
});



