import { action, makeAutoObservable, observable, runInAction } from "mobx"

export declare namespace StoreBlobs {
  export interface ImageBlob {
    blob: Blob
    blobURL: string
    thumbnailURL: string
    originImage: HTMLImageElement
  }
}

const getImageWithBlobURL = (blobURL: string): Promise<HTMLImageElement> => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image()
  image.onerror = (e) => reject(e)
<<<<<<< HEAD
  image.onload = (e) => {
    resolve(image)
  }
=======
  image.onload = (e) => { resolve(image) }
>>>>>>> 794ef74246f92f369f218ade8bd6a833e5d463ab
  image.src = blobURL
})

const formatBlobItem = async (blob: Blob) => {
  const blobURL = URL.createObjectURL(blob)
<<<<<<< HEAD

=======
>>>>>>> 794ef74246f92f369f218ade8bd6a833e5d463ab
  const originImage = await getImageWithBlobURL(blobURL)

  const canvas = document.createElement("canvas")
  if (originImage.width < originImage.height) {
    canvas.width = originImage.width / originImage.height * 200
    canvas.height = 200
  } else if (originImage.width > originImage.height) {
    canvas.width = 200
    canvas.height = originImage.height / originImage.width * 200
  } else {
    canvas.width = 200
    canvas.height = 200
  }

  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.imageSmoothingQuality = 'high'
  context.drawImage(originImage, 0, 0, canvas.width, canvas.height)

  const thumbnailBlob = await new Promise<Blob>(
    (resolve, reject) => canvas.toBlob(
      blob => blob ? resolve(blob) : reject()
    )
  )

<<<<<<< HEAD
  const item: StoreBlobs.ImageBlob = {
=======
  return {
>>>>>>> 794ef74246f92f369f218ade8bd6a833e5d463ab
    blob,
    blobURL,
    thumbnailURL: URL.createObjectURL(thumbnailBlob),
    originImage
  }
<<<<<<< HEAD

  return item
=======
>>>>>>> 794ef74246f92f369f218ade8bd6a833e5d463ab
}

class Store {
  @observable blobs: ({[id: string]: StoreBlobs.ImageBlob}) = {}

  constructor() {
    makeAutoObservable(this)
  }

  @action
  async push(blobs: Blob[], uuids: string[]) {
<<<<<<< HEAD
    let formatBlobs: StoreBlobs.ImageBlob[] = []

    try {
      formatBlobs = await Promise.all(blobs.map(formatBlobItem))
    } catch (err) {
      console.error(err)
      alert('图片加载失败\n请检查图片格式是否受浏览器支持')
      return
    }

    runInAction(() => {
      const blobs: ({[id: string]: StoreBlobs.ImageBlob}) = {}

      uuids.forEach((uuid, index) => {
        blobs[uuid] = formatBlobs[index]
      })

      // Object.assign(this.blobs, blobs)
      this.blobs = {
        ...this.blobs,
        ...blobs
      }
    })
  }
=======
    this.clearBlobs()

    let formatBlobs: StoreBlobs.ImageBlob[] = []

    const CONCURRENCY = 5

    for (let i = 0; i < blobs.length; i += CONCURRENCY) {
      const batch = blobs.slice(i, i + CONCURRENCY)

      try {
        const batchResults = await Promise.all(
          batch.map(blob => formatBlobItem(blob))
        )
        formatBlobs.push(...batchResults)
      } catch (err) {
        console.error(`批次 ${i} 失败:`, err)
        alert('图片加载失败\n请检查图片格式是否受浏览器支持')
        return
      }

      if (i + CONCURRENCY < blobs.length) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    runInAction(() => {
      const newBlobs: ({[id: string]: StoreBlobs.ImageBlob}) = {}
      uuids.forEach((uuid, index) => {
        newBlobs[uuid] = formatBlobs[index]
      })
      this.blobs = newBlobs
    })
  }

  @action
  clearBlobs() {
    Object.values(this.blobs).forEach(item => {
      URL.revokeObjectURL(item.blobURL)
      URL.revokeObjectURL(item.thumbnailURL)
    })
    this.blobs = {}
  }
>>>>>>> 794ef74246f92f369f218ade8bd6a833e5d463ab
}

export { Store }
export default new Store()
