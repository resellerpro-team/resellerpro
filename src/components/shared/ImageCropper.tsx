
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface ImageCropperProps {
    image: string
    open: boolean
    onClose: () => void
    onCropComplete: (croppedImage: Blob) => void
    aspectRatio?: number
}

function getCroppedImg(imageSrc: string, pixelCrop: any) {
    const image = new Image()
    image.src = imageSrc
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    return new Promise<Blob>((resolve, reject) => {
        image.onload = () => {
            canvas.width = pixelCrop.width
            canvas.height = pixelCrop.height

            ctx?.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            )

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'))
                    return
                }
                resolve(blob)
            }, 'image/jpeg')
        }
        image.onerror = reject
    })
}

export function ImageCropper({ image, open, onClose, onCropComplete, aspectRatio = 1 }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels)
            onCropComplete(croppedImage)
            onClose()
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogDescription>
                        Adjust the image to your liking.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative h-64 w-full">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>
                <div className="py-4">
                    <label className="text-sm font-medium">Zoom</label>
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(val) => setZoom(val[0])}
                        className="mt-2"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Apply Crop</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
