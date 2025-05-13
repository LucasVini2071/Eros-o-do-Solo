let gotas = [];
let solo;
let tipoSolo = "vegetacao"; // valor inicial
let arvores = [];
let passaros = [];
let predios = [];
let aviao; // Variável para o avião

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent("canvas-holder");

  solo = new Solo(tipoSolo);

  // Criar árvores no chão
  for (let i = 0; i < 20; i++) {
    arvores.push(new Arvore(random(20, width - 20), solo.altura - 50));
  }

  // Criar alguns pássaros mais altos
  if (tipoSolo === "vegetacao") {
    for (let i = 0; i < 5; i++) {
      passaros.push(new Passaro(random(width), random(height * 0.3, height * 0.6)));
    }
  }

  // Adicionar prédios na área urbanizada
  if (tipoSolo === "urbanizado") {
    for (let i = 0; i < 7; i++) {
      let alturaPredio = random(60, 150);
      predios.push(new Predio(random(50, width - 50), solo.altura - alturaPredio, alturaPredio));
    }
    // Criar o avião inicialmente fora da tela
    aviao = new Aviao(-100, 50);
  }
}

function draw() {
  background(173, 216, 230); // Céu azul claro

  for (let i = gotas.length - 1; i >= 0; i--) {
    gotas[i].cair();
    gotas[i].mostrar();

    if (gotas[i].atingeSolo(solo.altura)) {
      solo.aumentarErosao();
      gotas.splice(i, 1);

      // Ajustar a posição dos objetos ao aumentar a erosão
      let deltaErosao = solo.taxaErosao; // Usar a taxa de erosão para o ajuste
      for (let arvore of arvores) {
        arvore.y += deltaErosao;
      }
      for (let predio of predios) {
        predio.y += deltaErosao;
      }
    }
  }

  solo.mostrar();

  // Mostrar as árvores
  for (let arvore of arvores) {
    arvore.mostrar();
  }

  // Mostrar os pássaros
  for (let passaro of passaros) {
    passaro.voar();
    passaro.mostrar();
  }

  // Mostrar os prédios
  for (let predio of predios) {
    predio.mostrar();
  }

  // Mostrar e mover o avião se estiver na área urbanizada
  if (tipoSolo === "urbanizado" && aviao) {
    aviao.voar();
    aviao.mostrar();
  }

  if (frameCount % 8 === 0) { // Menos gotas caindo
    gotas.push(new Gota());
  }
}

function setSoilType(tipo) {
  tipoSolo = tipo;
  solo = new Solo(tipoSolo);

  // Recriar itens quando o tipo de solo mudar
  arvores = [];
  predios = [];
  passaros = [];
  aviao = null; // Remover o avião ao mudar o tipo de solo

  if (tipoSolo === "vegetacao") {
    for (let i = 0; i < 20; i++) {
      arvores.push(new Arvore(random(20, width - 20), solo.altura - 50));
    }
    for (let i = 0; i < 5; i++) {
      passaros.push(new Passaro(random(width), random(height * 0.3, height * 0.6)));
    }
  } else if (tipoSolo === "urbanizado") {
    for (let i = 0; i < 7; i++) {
      let alturaPredio = random(60, 150);
      predios.push(new Predio(random(50, width - 50), solo.altura - alturaPredio, alturaPredio));
    }
    // Criar o avião ao mudar para a área urbanizada
    aviao = new Aviao(-100, 50);
  }
}

class Gota {
  constructor() {
    this.x = random(width);
    this.y = -10; // Começam um pouco acima da tela
    this.vel = random(3, 7);
    this.comprimento = random(8, 12);
    this.espessura = random(1, 2);
  }

  cair() {
    this.y += this.vel;
  }

  mostrar() {
    stroke(0, 0, 150, 200); // Azul mais escuro e transparente
    strokeWeight(this.espessura);
    line(this.x, this.y, this.x, this.y + this.comprimento);
  }

  atingeSolo(ySolo) {
    return this.y > ySolo;
  }
}

class Solo {
  constructor(tipo) {
    this.tipo = tipo;
    this.alturaInicial = height - 40; // Altura inicial do solo
    this.altura = this.alturaInicial;
    this.erosao = 0;
    this.taxaErosao = 0; // Adicionando uma propriedade para a taxa de erosão
    this.corVegetacao = color(34, 139, 34); // Verde floresta
    this.corExposto = color(139, 69, 19);   // Marrom sela
    this.corUrbanizado = color(105, 105, 105); // Cinza escuro
  }

  aumentarErosao() {
    let taxa;
    if (this.tipo === "vegetacao") taxa = 0.08;
    else if (this.tipo === "exposto") taxa = 0.4;
    else if (this.tipo === "urbanizado") taxa = 0.2;

    this.taxaErosao = taxa; // Guarda a taxa de erosão atual
    this.erosao += taxa;
    this.altura = this.alturaInicial + this.erosao; // Atualiza a altura com a erosão
  }

  mostrar() {
    noStroke();
    if (this.tipo === "vegetacao") fill(this.corVegetacao);
    else if (this.tipo === "exposto") fill(this.corExposto);
    else if (this.tipo === "urbanizado") fill(this.corUrbanizado);

    rect(0, this.altura, width, height - this.altura);

    fill(0);
    textSize(12);
    textAlign(LEFT);
    text(`Erosão: ${this.erosao.toFixed(1)}`, 10, 20);
    text(`Tipo: ${this.tipo}`, 10, 35);
  }
}

class Arvore {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.yBase = y; // Guarda a posição y original da base da árvore
    this.troncoH = random(30, 50); // Altura do tronco
    this.troncoW = random(10, 15); // Largura do tronco
    this.copaRaio = random(15, 25); // Raio da copa
    this.corTronco = color(101, 67, 33); // Marrom madeira
    this.corCopa = color(0, 100, 0);    // Verde escuro
  }

  mostrar() {
    // Tronco
    fill(this.corTronco);
    rect(this.x - this.troncoW / 2, this.y, this.troncoW, this.troncoH);

    // Copa
    fill(this.corCopa);
    ellipse(this.x, this.y - this.copaRaio, this.copaRaio * 2, this.copaRaio * 1.5);
  }
}

class Passaro {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocidadeX = random(-1.5, 1.5);
    this.tamanho = random(8, 12);
    this.corPassaro = color(random(200, 255), random(200, 255), random(0)); // Cores mais claras
  }

  voar() {
    this.x += this.velocidadeX;
    if (this.x > width + this.tamanho || this.x < -this.tamanho) {
      this.velocidadeX *= -1;
    }
  }

  mostrar() {
    fill(this.corPassaro);
    ellipse(this.x, this.y, this.tamanho, this.tamanho * 0.7); // Forma de corpo
  }
}

class Predio {
  constructor(x, y, altura) {
    this.x = x;
    this.y = y;
    this.yBase = y + altura; // Guarda a posição y original da base do prédio
    this.largura = random(40, 70);
    this.altura = altura;
    this.corPredio = color(random(80, 150)); // Tons de cinza
    this.corJanela = color(220);             // Janelas claras
    this.numJanelasVert = floor(this.altura / 20);
    this.numJanelasHoriz = floor(this.largura / 15);
  }

  mostrar() {
    fill(this.corPredio);
    rect(this.x, this.y, this.largura, this.altura);

    // Desenhar janelas
    fill(this.corJanela);
    for (let i = 0; i < this.numJanelasVert; i++) {
      for (let j = 0; j < this.numJanelasHoriz; j++) {
        let janelaX = this.x + j * (this.largura / (this.numJanelasHoriz + 1)) + (this.largura / (this.numJanelasHoriz + 1)) / 2;
        let janelaY = this.y + i * (this.altura / (this.numJanelasVert + 1)) + (this.altura / (this.numJanelasVert + 1)) / 2;
        rect(janelaX - 5, janelaY - 5, 10, 10);
      }
    }
  }
}

class Aviao {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocidade = 2;
    this.tamanhoAsa = 20;
    this.tamanhoCorpo = 30;
    this.corAviao = color(200);
  }

  voar() {
    this.x += this.velocidade;
    if (this.x > width + this.tamanhoCorpo) {
      this.x = -this.tamanhoCorpo;
    }
  }

  mostrar() {
    fill(this.corAviao);
    // Corpo do avião
    rect(this.x, this.y - this.tamanhoCorpo / 4, this.tamanhoCorpo, this.tamanhoCorpo / 2);
    // Asas
    triangle(
      this.x + this.tamanhoCorpo / 4,
      this.y - this.tamanhoCorpo / 4 - this.tamanhoAsa / 2,
      this.x + this.tamanhoCorpo / 4 + this.tamanhoAsa,
      this.y - this.tamanhoCorpo / 4,
      this.x + this.tamanhoCorpo / 4,
      this.y - this.tamanhoCorpo / 4 + this.tamanhoAsa / 2
    );
    triangle(
      this.x + 3 * this.tamanhoCorpo / 4,
      this.y - this.tamanhoCorpo / 4 - this.tamanhoAsa / 2,
      this.x + 3 * this.tamanhoCorpo / 4 - this.tamanhoAsa,
      this.y - this.tamanhoCorpo / 4,
      this.x + 3 * this.tamanhoCorpo / 4,
      this.y - this.tamanhoCorpo / 4 + this.tamanhoAsa / 2
    );
    // Cauda
    triangle(
      this.x - this.tamanhoCorpo / 6,
      this.y - this.tamanhoCorpo / 4,
      this.x - this.tamanhoCorpo / 6 - this.tamanhoAsa / 3,
      this.y - this.tamanhoCorpo / 4 - this.tamanhoAsa / 3,
      this.x - this.tamanhoCorpo / 6,
      this.y - this.tamanhoCorpo / 4 + this.tamanhoAsa / 3
    );
  }
}
