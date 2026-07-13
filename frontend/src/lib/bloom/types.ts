export type FlowerId =
  | 'rose'
  | 'tulip'
  | 'daisy'
  | 'sunflower'
  | 'lavender'
  | 'peony'
  | 'blossom'
  | 'lily';

export type FlowerMeaningId =
  | 'love'
  | 'care'
  | 'joy'
  | 'warmth'
  | 'patience'
  | 'grace'
  | 'memory'
  | 'hope';

export type FlowerDef = {
  id: FlowerId;
  name: string;
  meaningId: FlowerMeaningId;
  meaning: string;
  meaningShort: string;
  color: string;
  petal: string;
  stem: string;
};

export type BouquetFlower = {
  flowerId: FlowerId;
  message: string;
};

export type BloomData = {
  envelope: {
    recipient_name: string;
    sender_name: string;
    opening: string;
  };
  bouquet: BouquetFlower[];
  note: {
    heading: string;
    body: string;
  };
  closing: {
    signed: string;
  };
};

export type BloomCard = BloomData;

export type FlowerPickerStep = {
  flowerId: FlowerId;
  message: string;
};
