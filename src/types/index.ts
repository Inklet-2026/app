export type AttachmentType = "image" | "link" | "clipboard";

export interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  preview: string;
  url?: string;
}
