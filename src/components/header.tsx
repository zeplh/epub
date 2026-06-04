import JSZip from 'jszip'
import { observer } from 'mobx-react'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import Icon from 'components/icon'
import storeMain from 'store/main'
// import storeBlobs from 'store/blobs'

type SupportType = 'image' | 'zip' | 'epub'

/**
 * 自然排序比较函数
 * 解决字符串排序时数字顺序错误的问题（如 img1.jpg, img10.jpg, img2.jpg）
 * @param a - 比较的字符串 a
 * @param b - 比较的字符串 b
 * @returns 比较结果：负数表示 a 在前，正数表示 b 在前
 */
const naturalCompare = (a: string, b: string): number => {
  const reg = /(\d+)|(\D+)/g
  const aParts = a.match(reg) || []
  const bParts = b.match(reg) || []
  
  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    const aPart = aParts[i]
    const bPart = bParts[i]
    const aNum = parseInt(aPart, 10)
    const bNum = parseInt(bPart, 10)
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) {
        return aNum - bNum
      }
    } else {
      const cmp = aPart.localeCompare(bPart)
      if (cmp !== 0) {
        return cmp
      }
    }
  }
  
  return aParts.length - bParts.length
}

const PageControl = observer(function(props: { pageIndex: number | null }) {
  const onUseImageSizeToPage = useCallback(() => {
    const pageItem = storeMain.book.pages[props.pageIndex as number]
    const image = storeMain.blobs.blobs[pageItem.blobID].originImage
    storeMain.book.updateBookPageProperty('pageSize', [
      image.width,
      image.height
    ])
  }, [props.pageIndex])

  const onChangePageIndex = useCallback(() => {
    const max = storeMain.book.pages.length
    const inputValue = window.prompt(`输入新页码位置 (1 - ${max})：`)
    let num = parseInt(inputValue || '')
    
    if (isNaN(num) || num < 1) {
      return
    } else if (num > max) {
      num = max
    }

    storeMain.replacePageIndex(props.pageIndex as number, num - 1)
  }, [props.pageIndex])

  const onSetContentq = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    storeMain.contents.setPageIndexToTitle(
      +(e.currentTarget.dataset.index as string),
      props.pageIndex as number
    )
  }, [props.pageIndex])

  const onSplitPage = useCallback(() => {
    storeMain.splitPage(props.pageIndex as number)
  }, [props.pageIndex])

  const onRemovePage = useCallback(() => {
    const res = window.confirm(`确认删除第 ${props.pageIndex as number + 1} 页？`)
    res && storeMain.removePage(props.pageIndex as number)
  }, [props.pageIndex])

  if (props.pageIndex === null) {
    return (
      <>
        <div className="nav-item">
          <button type="button" className="btn btn-outline-secondary disabled" disabled><Icon name="ruler"/></button>
        </div>
        <div className="nav-item">
          <button type="button" className="btn btn-outline-secondary disabled" disabled><Icon name="menu"/></button>
        </div>
        <div className="nav-item">
          <button type="button" className="btn btn-outline-secondary disabled" disabled><Icon name="bookmark"/></button>
        </div>
        <div className="nav-item">
          <button type="button" className="btn btn-outline-secondary disabled" disabled><Icon name="scissors"/></button>
        </div>
        <div className="nav-item">
          <button type="button" className="btn btn-outline-secondary disabled" disabled><Icon name="cross"/></button>
        </div>
      </>
    )
  }

  const blankPage = storeMain.book.pages[props.pageIndex].blank

  return (
    <>
      <div className="nav-item">
        <button type="button" className="btn btn-secondary" disabled={blankPage} onClick={onUseImageSizeToPage}>
            <Icon name="ruler"/>
          </button>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-secondary" onClick={onChangePageIndex}>
            <Icon name="menu"/>
          </button>
      </div>
      <div className="nav-item dropdown">
        <button type="button" className="btn btn-secondary"><Icon name="bookmark"/></button>
        <ul className="dropdown-menu" style={{top: 0,left:'100%'}}>
          {
            storeMain.contents.list.map((contentItem, index) =>
              <li key={index}>
                <span
                  className={"dropdown-item" + (contentItem.pageIndex === props.pageIndex ? ' active' : '')}
                  data-index={index}
                  onClick={onSetContentq}
                >
                  {contentItem.title}
                </span>
              </li>
            )
          }
        </ul>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-secondary" disabled={blankPage} onClick={onSplitPage}>
          <Icon name="scissors"/>
        </button>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-secondary" onClick={onRemovePage}>
          <Icon name="cross"/>
        </button>
      </div>
    </>
  )
})

const AcceptMap = {
  image: 'image/jpeg,image/png,image/webp,image/avif',
  zip: 'application/zip',
  epub: 'application/epub+zip',
}

const MultipleAttrMap = {
  image: true,
  zip: false,
  epub: false,
}

const blobToFile = (theBlob: Blob, fileName:string): File => {
  var b: any = theBlob
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  b.lastModifiedDate = new Date()
  b.name = fileName

  //Cast to a File() type
  return theBlob as File
}

/**
 * 通过文件扩展名获取 MIME 类型
 * 用于辅助二进制头检测，提高识别准确率
 * @param fileName - 文件名
 * @returns MIME 类型或 null
 */
const getMimeTypeByExtension = (fileName: string): string | null => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'avif':
      return 'image/avif'
    default:
      return null
  }
}

/**
 * 通过文件二进制头检测 MIME 类型
 * @param uint8Array - 文件的 Uint8Array 数据
 * @param fileName - 文件名（用于辅助判断 AVIF 等格式）
 * @returns MIME 类型或 null
 */
const detectMimeType = (uint8Array: Uint8Array, fileName: string): string | null => {
  // 检查二进制头的方法参考自：
  // https://stackoverflow.com/questions/18299806/how-to-check-file-mime-type-with-javascript-before-upload
  const header = Array.from(uint8Array.subarray(0, 4)).map(item => item.toString(16).padStart(2, '0')).join('')
  
  switch (header) {
    case '89504e47':
      return 'image/png'
    case '52494646':
      return 'image/webp'
    case 'ffd8ffe0':
    case 'ffd8ffe1':
    case 'ffd8ffe2':
    case 'ffd8ffe3':
    case 'ffd8ffe8':
      return 'image/jpeg'
    default:
      // AVIF 基于 ISOBMFF 格式，没有固定的 4 字节 magic number
      // 通过文件扩展名辅助判断
      return getMimeTypeByExtension(fileName)
  }
}

const Header = function() {
  const store = React.useContext(React.createContext(storeMain.ui))
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputType, setInputType] = useState<SupportType>('zip') // 修改这里可以改默认格式

  const onClickToggleBookVisible = useCallback(() => {
    store.toggleBookVisible()
  }, [store])
  const onClickToggleContentVisible = useCallback(() => {
    store.toggleContentVisible()
  }, [store])
  const onClickTogglePageVisible = useCallback(() => {
    store.togglePageVisible()
  }, [store])

  const onClickImport = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const newType = e.currentTarget.dataset.type as SupportType

    if (newType === inputType) {
      inputRef.current?.click()
    } else {
      setInputType(newType)
    }
  }, [inputType])

  const handleGetFile = useCallback(async () => {
    const input: HTMLInputElement = inputRef.current as HTMLInputElement

    if (inputType === 'zip' && (input?.files?.[0])) {
      const fileName = input.files[0].name
      
      try {
        const zipContent = await JSZip.loadAsync(input.files[0])
        
        // 获取所有文件条目（排除目录），并按文件名自然排序
        const zipEntries = Object.values(zipContent.files)
          .filter(zipItem => !zipItem.dir) // 过滤掉目录条目
          .sort((a, b) => naturalCompare(a.name, b.name)) // 使用自然排序
        
        if (zipEntries.length === 0) {
          alert('ZIP 压缩包中没有找到文件')
          return
        }

        // 解析所有文件条目
        const filePromises = zipEntries.map(async (zipItem) => {
          try {
            const uint8Array = await zipItem.async('uint8array')
            const mimeType = detectMimeType(uint8Array, zipItem.name)

            if (mimeType) {
              const b = new Blob([uint8Array], { type: mimeType })
              // 提取文件名（去掉路径前缀）
              const baseName = zipItem.name.replace(/^.+\//, '')
              return blobToFile(b, baseName)
            }
            return null
          } catch (err) {
            console.error(`解析文件 ${zipItem.name} 时出错：`, err)
            return null
          }
        })

        const files = await Promise.all(filePromises)
        const validFiles = files.filter((f): f is File => f !== null)
        
        if (validFiles.length === 0) {
          alert('ZIP 压缩包中没有找到支持的图片格式（支持：jpg、png、webp、avif）')
          return
        }

        // 导入图片并按文件名排序
        const sortedFiles = validFiles.sort((a, b) => naturalCompare(a.name, b.name))
        storeMain.importPageFromImages(sortedFiles)
        
        if (storeMain.ui.firstImport) {
          storeMain.ui.toggleBookVisible(fileName)
        }
      } catch (err) {
        console.error('解析 ZIP 文件失败：', err)
        alert('解析 ZIP 文件失败，请检查文件是否损坏')
      }
      return
    }

    // 处理直接导入图片（jpg、png、webp、avif）
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files)
      // 按文件名自然排序，确保顺序一致
      const sortedFiles = files.sort((a, b) => naturalCompare(a.name, b.name))
      storeMain.importPageFromImages(sortedFiles)
    }
  }, [inputType])

  const onClickInsertBlankPage = useCallback(() => {
    const max = storeMain.book.pages.length
    const inputValue = window.prompt(`输入插入位置 (1 - ${max})：`)
    let num = parseInt(inputValue || '')
    
    if (isNaN(num) || num < 1) {
      return
    } else if (num > max) {
      num = max
    }

    storeMain.insertBlankPage(num - 1)
  }, [])

  const onClickGenerate = useCallback(() => {
    storeMain.generateBook()
  }, [])

  useLayoutEffect(() => {
    setTimeout(() => {
      inputRef.current?.click()
    }, 0)
  }, [inputType])

  return (
    <nav id="nav" className="navbar bg-dark">
      <div className="nav-item dropdown">
        <button type="button" className="btn btn-primary">
          <Icon name="upload"/>
        </button>
        <ul className="dropdown-menu" style={{top: 0,left:'100%'}}>
          <li><span className="dropdown-item" data-type="image" onClick={onClickImport}>图片</span></li>
          <li><span className="dropdown-item" data-type="zip" onClick={onClickImport}>ZIP</span></li>
          {/* <li><span className="dropdown-item" data-type="epub" onClick={onClickImport}>epub</span></li> */}
        </ul>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-primary" onClick={onClickToggleBookVisible} title="书籍信息"><Icon name="book"/></button>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-primary" onClick={onClickToggleContentVisible} title="目录"><Icon name="list"/></button>
      </div>
      <div className="nav-item">
        <button type="button" className="btn btn-primary" onClick={onClickTogglePageVisible} title="页面设置"><Icon name="tools"/></button>
      </div>
      <div className="nav-item">
        <button
          type="button"
          className="btn btn-primary"
          disabled={storeMain.book.pages.length === 0}
          onClick={onClickInsertBlankPage}
          title="插入空白页"
        >
          <Icon name="notification"/>
        </button>
      </div>
      <div className="nav-item">
        <button
          type="button"
          className="btn btn-primary"
          disabled={storeMain.book.pages.length === 0}
          onClick={onClickGenerate}
          title="生成 EPUB"
        >
          <Icon name="install"/>
        </button>
      </div>
      <PageControl pageIndex={store.selectedPageIndex}/>
      <input
        key={inputType}
        id="input-upload"
        ref={inputRef}
        type="file"
        value=""
        accept={AcceptMap[inputType]}
        multiple={MultipleAttrMap[inputType]}
        onChange={handleGetFile}
        style={{display:"none"}}
      />
    </nav>
  )
}

export default observer(Header)
