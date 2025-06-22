export interface ModelWeights {
  layers: number[][][]
  biases: number[][]
  metadata: {
    inputSize: number
    hiddenSizes: number[]
    outputSize: number
    learningRate: number
    version: number
    lastUpdated: number
  }
}

export class NeuralEngine {
  private gl: WebGLRenderingContext | null = null
  private useWebGL = false
  private weights: ModelWeights
  private activations: number[][] = []

  constructor(initialWeights?: ModelWeights) {
    this.weights = initialWeights || this.createDefaultModel()
    this.initializeWebGL()
  }

  private initializeWebGL(): void {
    try {
      const canvas = document.createElement("canvas")
      this.gl = canvas.getContext("webgl")
      this.useWebGL = !!this.gl
      console.log(`Using ${this.useWebGL ? "WebGL" : "CPU"} for computations`)
    } catch (error) {
      console.warn("WebGL not available, falling back to CPU")
      this.useWebGL = false
    }
  }

  private createDefaultModel(): ModelWeights {
    // Create a simple 3-layer network: input -> hidden -> output
    const inputSize = 100 // Token embedding size
    const hiddenSize = 64
    const outputSize = 100

    return {
      layers: [this.randomMatrix(inputSize, hiddenSize), this.randomMatrix(hiddenSize, outputSize)],
      biases: [this.randomArray(hiddenSize), this.randomArray(outputSize)],
      metadata: {
        inputSize,
        hiddenSizes: [hiddenSize],
        outputSize,
        learningRate: 0.001,
        version: 1,
        lastUpdated: Date.now(),
      },
    }
  }

  private randomMatrix(rows: number, cols: number): number[][] {
    return Array(rows)
      .fill(0)
      .map(() =>
        Array(cols)
          .fill(0)
          .map(() => (Math.random() - 0.5) * 0.1),
      )
  }

  private randomArray(size: number): number[] {
    return Array(size)
      .fill(0)
      .map(() => (Math.random() - 0.5) * 0.1)
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x))
  }

  private matrixMultiply(a: number[][], b: number[][]): number[][] {
    if (this.useWebGL && this.gl) {
      return this.matrixMultiplyWebGL(a, b)
    }
    return this.matrixMultiplyCPU(a, b)
  }

  private matrixMultiplyCPU(a: number[][], b: number[][]): number[][] {
    const result: number[][] = []
    for (let i = 0; i < a.length; i++) {
      result[i] = []
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j]
        }
        result[i][j] = sum
      }
    }
    return result
  }

  private matrixMultiplyWebGL(a: number[][], b: number[][]): number[][] {
    // Simplified WebGL implementation - in practice, you'd use shaders
    // For now, fall back to CPU
    return this.matrixMultiplyCPU(a, b)
  }

  public forward(input: number[]): number[] {
    this.activations = [input]
    let currentActivation = input

    // Forward pass through each layer
    for (let i = 0; i < this.weights.layers.length; i++) {
      const weights = this.weights.layers[i]
      const biases = this.weights.biases[i]

      // Matrix multiplication: input * weights + bias
      const weightedSum = weights[0].map((_, colIndex) => {
        let sum = biases[colIndex]
        for (let rowIndex = 0; rowIndex < currentActivation.length; rowIndex++) {
          sum += currentActivation[rowIndex] * weights[rowIndex][colIndex]
        }
        return sum
      })

      // Apply activation function
      currentActivation = weightedSum.map((x) => this.sigmoid(x))
      this.activations.push([...currentActivation])
    }

    return currentActivation
  }

  public backward(input: number[], target: number[], output: number[]): void {
    const learningRate = this.weights.metadata.learningRate

    // Calculate output layer error
    const outputError = output.map((o, i) => target[i] - o)
    const outputDelta = outputError.map((e, i) => e * output[i] * (1 - output[i]))

    // Update output layer weights
    const lastLayerIndex = this.weights.layers.length - 1
    const hiddenActivation = this.activations[lastLayerIndex]

    for (let i = 0; i < this.weights.layers[lastLayerIndex].length; i++) {
      for (let j = 0; j < this.weights.layers[lastLayerIndex][i].length; j++) {
        this.weights.layers[lastLayerIndex][i][j] += learningRate * outputDelta[j] * hiddenActivation[i]
      }
    }

    // Update output layer biases
    for (let i = 0; i < outputDelta.length; i++) {
      this.weights.biases[lastLayerIndex][i] += learningRate * outputDelta[i]
    }

    // Update metadata
    this.weights.metadata.lastUpdated = Date.now()
    this.weights.metadata.version++
  }

  public getWeights(): ModelWeights {
    return JSON.parse(JSON.stringify(this.weights))
  }

  public loadWeights(weights: ModelWeights): void {
    this.weights = weights
  }
}
