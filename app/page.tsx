"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const productos = [
  "Semillas",
  "Chips Coco",
  "Chips Mango",
  "Imperial",
  "Bavaria",
  "S. Pellegrino",
  "Limonada",
  "Cápsulas de Café",
  "Café Descafeinado",
  "Chocolates",
  "Galleta",
  "Vino Blanco",
  "Vino Tinto",
  "Kit Dental",
  "Kit de Afeitar",
  "Vanity Kit",
  "Gorra de Baño",
  "Esponja",
];

const villas = Array.from(
  { length: 12 },
  (_, index) => `Villa ${String(index + 1).padStart(2, "0")}`
);

type Item = {
  producto: string;
  cantidad: number;
};

type Reporte = {
  fecha: string;
  villa: string;
  colaborador: string;
  items: Item[];
};

function fechaLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [vista, setVista] = useState<"registro" | "reportes">("registro");

  const [fecha, setFecha] = useState(fechaLocal(new Date()));
  const [villa, setVilla] = useState("Villa 01");
  const [colaborador, setColaborador] = useState("Katherine");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [items, setItems] = useState<Item[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarReportes() {
      setCargando(true);

      const hoy = new Date();

      const ayer = new Date();
      ayer.setDate(hoy.getDate() - 1);

      const fechaHoy = fechaLocal(hoy);
      const fechaAyer = fechaLocal(ayer);

      const { data, error } = await supabase
        .from("reportes")
        .select("fecha, villa, colaborador, productos, created_at")
        .gte("fecha", fechaAyer)
        .lte("fecha", fechaHoy)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar reportes:", error);
        setCargando(false);
        return;
      }

      const reportesCargados: Reporte[] = (data ?? []).map((reporte) => ({
        fecha: reporte.fecha,
        villa: reporte.villa,
        colaborador: reporte.colaborador,
        items: reporte.productos ?? [],
      }));

      setReportes(reportesCargados);
      setCargando(false);
    }

    cargarReportes();
  }, []);

  function agregarProducto() {
    if (!producto || cantidad < 1) return;

    setItems([...items, { producto, cantidad }]);
    setProducto("");
    setCantidad(1);
  }

  function eliminarProducto(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function guardarReporte() {
    if (items.length === 0) return;

    const { error } = await supabase.from("reportes").insert([
      {
        fecha,
        villa,
        colaborador,
        productos: items,
      },
    ]);

    if (error) {
      console.error("Error al guardar:", error);
      alert("No se pudo guardar el reporte.");
      return;
    }

    const hoy = fechaLocal(new Date());

    const ayerDate = new Date();
    ayerDate.setDate(ayerDate.getDate() - 1);

    const ayer = fechaLocal(ayerDate);

    const nuevoReporte: Reporte = {
      fecha,
      villa,
      colaborador,
      items: [...items],
    };

    if (fecha === hoy || fecha === ayer) {
      setReportes((anteriores) => [nuevoReporte, ...anteriores]);
    }

    setItems([]);
    setProducto("");
    setCantidad(1);
    setVista("reportes");
  }

  return (
    <main className="min-h-screen bg-[#f6f5ef] px-4 py-6">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">

        {/* ENCABEZADO */}
        <header className="border-b border-[#c4932f] bg-[#f8f3e8] px-5 py-6">
          <div className="flex items-center justify-center gap-5">
            <Image
              src="/logo.png"
              alt="Hotel Three Sixty Ojochal"
              width={120}
              height={120}
              className="h-auto w-[120px]"
              priority
            />

            <div className="h-24 w-px bg-[#c4932f]" />

            <div className="flex items-center gap-3">
              <div className="h-px w-7 bg-[#c4932f]" />

              <h1 className="text-3xl font-medium tracking-[0.12em] text-[#0f4a37]">
                MINIBAR
              </h1>

              <div className="h-px w-7 bg-[#c4932f]" />
            </div>
          </div>
        </header>

        {/* PESTAÑAS */}
        <div className="grid grid-cols-2 border-b text-center text-sm font-medium">
          <button
            onClick={() => setVista("registro")}
            className={`px-4 py-4 ${
              vista === "registro"
                ? "border-b-2 border-[#0f4a37] text-[#0f4a37]"
                : "text-gray-500"
            }`}
          >
            Nuevo registro
          </button>

          <button
            onClick={() => setVista("reportes")}
            className={`px-4 py-4 ${
              vista === "reportes"
                ? "border-b-2 border-[#0f4a37] text-[#0f4a37]"
                : "text-gray-500"
            }`}
          >
            Reportes
          </button>
        </div>

        {/* NUEVO REGISTRO */}
        {vista === "registro" && (
          <section className="space-y-5 p-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Fecha
              </label>

              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Villa
              </label>

              <select
                value={villa}
                onChange={(e) => setVilla(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3"
              >
                {villas.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Colaborador
              </label>

              <select
                value={colaborador}
                onChange={(e) => setColaborador(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3"
              >
                <option value="Katherine">Katherine</option>
                <option value="Laura">Laura</option>
              </select>
            </div>

            <div className="grid grid-cols-[1fr_100px] gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Producto
                </label>

                <select
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white p-3"
                >
                  <option value="">Seleccionar</option>

                  {productos.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Cantidad
                </label>

                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 p-3 text-center"
                />
              </div>
            </div>

            <button
              onClick={agregarProducto}
              className="w-full rounded-xl border border-[#b88a2d] py-3 font-semibold text-[#0f4a37]"
            >
              + Agregar producto
            </button>

            {items.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="border-b px-4 py-3">
                  <h2 className="font-semibold text-[#0f4a37]">
                    Productos agregados
                  </h2>
                </div>

                {items.map((item, index) => (
                  <div
                    key={`${item.producto}-${index}`}
                    className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                  >
                    <span>{item.producto}</span>

                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        {item.cantidad}
                      </span>

                      <button
                        onClick={() => eliminarProducto(index)}
                        className="text-sm text-red-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={guardarReporte}
              className="w-full rounded-xl bg-[#0f4a37] py-4 font-semibold text-white"
            >
              Guardar reporte
            </button>
          </section>
        )}

        {/* REPORTES */}
        {vista === "reportes" && (
          <section className="space-y-4 p-5">
            <div>
              <h2 className="text-xl font-bold text-[#0f4a37]">
                Reportes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Historial de hoy y ayer
              </p>
            </div>

            {cargando ? (
              <div className="rounded-xl border p-4 text-center text-gray-500">
                Cargando reportes...
              </div>
            ) : reportes.length === 0 ? (
              <div className="rounded-xl border p-4 text-center text-gray-500">
                No hay reportes de hoy ni de ayer.
              </div>
            ) : (
              reportes.map((reporte, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-gray-200"
                >
                  <div className="bg-[#f8f3e8] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#0f4a37]">
                        {reporte.villa}
                      </strong>

                      <span className="text-sm text-gray-600">
                        {new Date(
                          reporte.fecha + "T00:00:00"
                        ).toLocaleDateString("es-CR")}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {reporte.colaborador}
                    </p>
                  </div>

                  <div>
                    <div className="grid grid-cols-[1fr_80px] border-b px-4 py-2 text-sm font-semibold text-[#0f4a37]">
                      <span>Producto</span>
                      <span className="text-center">Cantidad</span>
                    </div>

                    {reporte.items.map((item, itemIndex) => (
                      <div
                        key={`${item.producto}-${itemIndex}`}
                        className="grid grid-cols-[1fr_80px] border-b px-4 py-3 last:border-b-0"
                      >
                        <span>{item.producto}</span>

                        <span className="text-center font-semibold">
                          {item.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        )}
      </div>
    </main>
  );
}