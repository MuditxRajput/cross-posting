import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { useCallback, useState } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';

interface EnhancedImageEditorProps {
  image: string;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
}

type Filter = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'cold' | 'warm';

interface FilterOption {
  [key: string]: string;
}

interface AspectRatio {
  value: number;
  label: string;
}

const FILTERS: FilterOption = {
  none: 'None',
  grayscale: 'Grayscale',
  sepia: 'Sepia',
  vintage: 'Vintage',
  cold: 'Cold',
  warm: 'Warm',
};

const ASPECT_RATIOS: AspectRatio[] = [
  { value: 1 / 1, label: '1:1 (Square)' },
  { value: 4 / 5, label: '4:5 (Portrait)' },
  { value: 16 / 9, label: '16:9 (Landscape)' },
  { value: 9 / 16, label: '9:16 (Story)' },
];

export default function EnhancedImageEditor({ image, onSave, onCancel }: EnhancedImageEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [sharpen, setSharpen] = useState<number>(0);
  const [currentFilter, setCurrentFilter] = useState<Filter>('none');
  const [aspect, setAspect] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyFilter = (ctx: CanvasRenderingContext2D, imageData: ImageData): ImageData => {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;

      switch (currentFilter) {
        case 'grayscale':
          const gray = (r + g + b) / 3;
          data[i] = data[i + 1] = data[i + 2] = gray;
          break;
        case 'sepia':
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          break;
        case 'vintage':
          data[i] = Math.min(255, r * 1.1 + g * 0.1 + b * 0.1);
          data[i + 1] = Math.min(255, r * 0.1 + g * 0.9 + b * 0.1);
          data[i + 2] = Math.min(255, r * 0.1 + g * 0.1 + b * 0.9);
          break;
        case 'cold':
          data[i] = Math.min(255, r * 0.9);
          data[i + 1] = g;
          data[i + 2] = Math.min(255, b * 1.1);
          break;
        case 'warm':
          data[i] = Math.min(255, r * 1.1);
          data[i + 1] = g;
          data[i + 2] = Math.min(255, b * 0.9);
          break;
      }
    }
    return imageData;
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return;
    }

    const img = new Image();

    img.onload = () => {
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        blur(${blur}px)
      `;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      if (currentFilter !== 'none') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const filteredData = applyFilter(ctx, imageData);
        ctx.putImageData(filteredData, 0, 0);
      }

      const editedImage = canvas.toDataURL('image/jpeg', 0.95);
      onSave(editedImage);
    };

    img.src = image;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full h-[300px] md:h-[400px] bg-gray-50">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          classes={{
            containerClassName: "rounded-lg"
          }}
        />
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <Label>Preset Filters</Label>
          <Select
            value={currentFilter}
            onValueChange={(value) => setCurrentFilter(value as Filter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FILTERS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Aspect Ratio</Label>
          <Select
            value={aspect.toString()}
            onValueChange={(value) => setAspect(parseFloat(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value.toString()}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Zoom</Label>
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
          />
        </div>

        <div className="space-y-2">
          <Label>Rotation</Label>
          <Slider
            min={0}
            max={360}
            value={[rotation]}
            onValueChange={(value) => setRotation(value[0])}
          />
        </div>

        <div className="space-y-2">
          <Label>Brightness</Label>
          <Slider
            min={0}
            max={200}
            value={[brightness]}
            onValueChange={(value) => setBrightness(value[0])}
          />
        </div>

        <div className="space-y-2">
          <Label>Contrast</Label>
          <Slider
            min={0}
            max={200}
            value={[contrast]}
            onValueChange={(value) => setContrast(value[0])}
          />
        </div>

        <div className="space-y-2">
          <Label>Saturation</Label>
          <Slider
            min={0}
            max={200}
            value={[saturation]}
            onValueChange={(value) => setSaturation(value[0])}
          />
        </div>

        <div className="space-y-2">
          <Label>Blur</Label>
          <Slider
            min={0}
            max={10}
            step={0.1}
            value={[blur]}
            onValueChange={(value) => setBlur(value[0])}
          />
        </div>

        <div className="space-y-2">
          <Label>Sharpen</Label>
          <Slider
            min={0}
            max={10}
            step={0.1}
            value={[sharpen]}
            onValueChange={(value) => setSharpen(value[0])}
          />
        </div>

        <div className="flex justify-between gap-4 pt-4">
          <Button 
            onClick={onCancel}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="w-full"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}