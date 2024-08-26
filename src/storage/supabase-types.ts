export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cene: {
        Row: {
          kg: number | null
          kom: number | null
          kupac_id: number
          proizvod_id: number
          rabat_kg: number | null
          rabat_kom: number | null
        }
        Insert: {
          kg?: number | null
          kom?: number | null
          kupac_id: number
          proizvod_id: number
          rabat_kg?: number | null
          rabat_kom?: number | null
        }
        Update: {
          kg?: number | null
          kom?: number | null
          kupac_id?: number
          proizvod_id?: number
          rabat_kg?: number | null
          rabat_kom?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cene_kupac_id_fkey"
            columns: ["kupac_id"]
            isOneToOne: false
            referencedRelation: "kupci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cene_proizvod_id_fkey"
            columns: ["proizvod_id"]
            isOneToOne: false
            referencedRelation: "proizvodi"
            referencedColumns: ["id"]
          },
        ]
      }
      kupci: {
        Row: {
          adresa: string | null
          aktivan: boolean | null
          id: number
          ime: string | null
          mbr: string | null
          otpremljeno_mesto: string | null
          otpremljeno_naziv: string | null
          otpremljeno_ulica: string | null
          pib: string | null
          stanje: number | null
          tkr: string | null
          valuta: number | null
        }
        Insert: {
          adresa?: string | null
          aktivan?: boolean | null
          id?: number
          ime?: string | null
          mbr?: string | null
          otpremljeno_mesto?: string | null
          otpremljeno_naziv?: string | null
          otpremljeno_ulica?: string | null
          pib?: string | null
          stanje?: number | null
          tkr?: string | null
          valuta?: number | null
        }
        Update: {
          adresa?: string | null
          aktivan?: boolean | null
          id?: number
          ime?: string | null
          mbr?: string | null
          otpremljeno_mesto?: string | null
          otpremljeno_naziv?: string | null
          otpremljeno_ulica?: string | null
          pib?: string | null
          stanje?: number | null
          tkr?: string | null
          valuta?: number | null
        }
        Relationships: []
      }
      proizvodi: {
        Row: {
          aktivan: boolean | null
          ean: string | null
          ean_rinfuz: string | null
          id: number
          ime: string | null
          kratko_ime: string | null
          na_spisku: number | null
          nastavak_kg: string | null
          nastavak_kom: string | null
        }
        Insert: {
          aktivan?: boolean | null
          ean?: string | null
          ean_rinfuz?: string | null
          id?: number
          ime?: string | null
          kratko_ime?: string | null
          na_spisku?: number | null
          nastavak_kg?: string | null
          nastavak_kom?: string | null
        }
        Update: {
          aktivan?: boolean | null
          ean?: string | null
          ean_rinfuz?: string | null
          id?: number
          ime?: string | null
          kratko_ime?: string | null
          na_spisku?: number | null
          nastavak_kg?: string | null
          nastavak_kom?: string | null
        }
        Relationships: []
      }
      racuni: {
        Row: {
          datum: string | null
          datum_valute: string | null
          id: number
          iznos: number
          koristi_200g: boolean | null
          kupac_id: number | null
          popust: number
          rb: string | null
          saldo: number | null
          za_uplatu: number
        }
        Insert: {
          datum?: string | null
          datum_valute?: string | null
          id?: number
          iznos?: number
          koristi_200g?: boolean | null
          kupac_id?: number | null
          popust?: number
          rb?: string | null
          saldo?: number | null
          za_uplatu?: number
        }
        Update: {
          datum?: string | null
          datum_valute?: string | null
          id?: number
          iznos?: number
          koristi_200g?: boolean | null
          kupac_id?: number | null
          popust?: number
          rb?: string | null
          saldo?: number | null
          za_uplatu?: number
        }
        Relationships: [
          {
            foreignKeyName: "racuni_kupac_id_fkey"
            columns: ["kupac_id"]
            isOneToOne: false
            referencedRelation: "kupci"
            referencedColumns: ["id"]
          },
        ]
      }
      st_proizvodi: {
        Row: {
          cena: number | null
          ean: string | null
          jm: string | null
          kolicina: number | null
          na_spisku: number
          naziv: string | null
          osnovica: number | null
          proizvod_id: number
          rabat: number | null
          racun_id: number
          rinfuz: boolean | null
          vrednost: number | null
        }
        Insert: {
          cena?: number | null
          ean?: string | null
          jm?: string | null
          kolicina?: number | null
          na_spisku: number
          naziv?: string | null
          osnovica?: number | null
          proizvod_id: number
          rabat?: number | null
          racun_id: number
          rinfuz?: boolean | null
          vrednost?: number | null
        }
        Update: {
          cena?: number | null
          ean?: string | null
          jm?: string | null
          kolicina?: number | null
          na_spisku?: number
          naziv?: string | null
          osnovica?: number | null
          proizvod_id?: number
          rabat?: number | null
          racun_id?: number
          rinfuz?: boolean | null
          vrednost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "st_proizvodi_proizvod_id_fkey"
            columns: ["proizvod_id"]
            isOneToOne: false
            referencedRelation: "proizvodi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_proizvodi_racun_id_fkey"
            columns: ["racun_id"]
            isOneToOne: false
            referencedRelation: "racuni"
            referencedColumns: ["id"]
          },
        ]
      }
      uplate: {
        Row: {
          datum: string | null
          id: number
          iznos: number | null
          kupac_id: number | null
          racun_id: number | null
          saldo: number | null
        }
        Insert: {
          datum?: string | null
          id: number
          iznos?: number | null
          kupac_id?: number | null
          racun_id?: number | null
          saldo?: number | null
        }
        Update: {
          datum?: string | null
          id?: number
          iznos?: number | null
          kupac_id?: number | null
          racun_id?: number | null
          saldo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "uplate_kupac_id_fkey"
            columns: ["kupac_id"]
            isOneToOne: false
            referencedRelation: "kupci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uplate_racun_id_fkey"
            columns: ["racun_id"]
            isOneToOne: false
            referencedRelation: "racuni"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      next_racun_rb: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
