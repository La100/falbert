export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_models: {
        Row: {
          id: string
          user_id: string
          url_id: string
          name: string
          fal_id: string
          supports_file_upload: boolean
          is_custom: boolean
          lora_path: string | null
          created_at: string
          updated_at: string
          trigger_word: string | null
        }
        Insert: {
          id?: string
          user_id: string
          url_id: string
          name: string
          fal_id: string
          supports_file_upload?: boolean
          is_custom?: boolean
          lora_path?: string | null
          created_at?: string
          updated_at?: string
          trigger_word?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          url_id?: string
          name?: string
          fal_id?: string
          supports_file_upload?: boolean
          is_custom?: boolean
          lora_path?: string | null
          created_at?: string
          updated_at?: string
          trigger_word?: string | null
        }
      }
    }
  }
}
