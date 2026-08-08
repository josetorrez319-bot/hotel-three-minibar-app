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
    if (items.length === 0) {
      alert("Agrega al menos un producto.");
      return;
    }

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
    <main className="min-h-screen bg-[#f5f2ea] px-3 py-5 sm:px-5 sm:py-8">
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-[32px] border border-[#e8dfce] bg-[#fffdf8] shadow-[0_20px_60px_rgba(49,40,23,0.13)]">

        {/* ENCABEZADO */}
        <header className="relative overflow-hidden border-b border-[#c9973e] bg-[#f7f1e4] px-6 py-9">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border border-[#d8c7a4]/30" />
          <div className="pointer-events-none absolute -right-4 top-10 h-32 w-32 rounded-full border border-[#d8c7a4]/20" />

          <div className="relative flex items-center justify-center gap-7">
            <div className="flex w-[120px] justify-center">
              <Image
                src="/logo.png"
                alt="Hotel Three Sixty Ojochal"
                width={130}
                height={130}
                className="h-auto w-[125px]"
                priority
              />
            </div>

            <div className="h-28 w-px bg-[#c9973e]" />

            <div className="flex flex-col items-center">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-7 bg-[#c9973e]" />
                <span className="text-[#c9973e]">✦</span>
                <div className="h-px w-7 bg-[#c9973e]" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px w-7 bg-[#c9973e]" />

                <h1 className="text-3xl font-medium tracking-[0.16em] text-[#0d4d3b] sm:text-4xl">
                  MINIBAR
                </h1>

                <div className="h-px w-7 bg-[#c9973e]" />
              </div>

              <p className="mt-3 text-[10px] font-medium tracking-[0.34em] text-[#b78631]">
                HOTEL THREE SIXTY
              </p>
            </div>
          </div>
        </header>

        {/* PESTAÑAS */}
        <div className="grid grid-cols-2 border-b border-[#ddd6c9] bg-white">
          <button
            onClick={() => setVista("registro")}
            className={`relative flex items-center justify-center gap-2 px-4 py-5 text-sm font-semibold transition ${
              vista === "registro"
                ? "text-[#0d4d3b]"
                : "text-gray-500 hover:text-[#0d4d3b]"
            }`}
          >
            <span className="text-[#c9973e]">▣</span>
            Nuevo registro

            {vista === "registro" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#0d4d3b]" />
            )}
          </button>

          <button
            onClick={() => setVista("reportes")}
            className={`relative flex items-center justify-center gap-2 px-4 py-5 text-sm font-semibold transition ${
              vista === "reportes"
                ? "text-[#0d4d3b]"
                : "text-gray-500 hover:text-[#0d4d3b]"
            }`}
          >
            <span>▥</span>
            Reportes

            {vista === "reportes" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#0d4d3b]" />
            )}
          </button>
        </div>

        {/* NUEVO REGISTRO */}
        {vista === "registro" && (
          <section className="p-5 sm:p-7">
            <div className="space-y-6 rounded-[26px] border border-[#ebe5da] bg-white p-5 shadow-[0_8px_30px_rgba(64,48,20,0.07)] sm:p-7">

              {/* FECHA */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0d4d3b]">
                  Fecha
                </label>

                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-2xl border border-[#d8d3ca] bg-[#fffefa] px-4 py-4 text-gray-800 outline-none transition focus:border-[#c9973e] focus:ring-2 focus:ring-[#c9973e]/15"
                />
              </div>

              {/* VILLA Y COLABORADOR */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d4d3b]">
                    Villa
                  </label>

                  <select
                    value={villa}
                    onChange={(e) => setVilla(e.target.value)}
                    className="w-full rounded-2xl border border-[#d8d3ca] bg-[#fffefa] px-4 py-4 outline-none transition focus:border-[#c9973e] focus:ring-2 focus:ring-[#c9973e]/15"
                  >
                    {villas.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d4d3b]">
                    Colaborador
                  </label>

                  <select
                    value={colaborador}
                    onChange={(e) => setColaborador(e.target.value)}
                    className="w-full rounded-2xl border border-[#d8d3ca] bg-[#fffefa] px-4 py-4 outline-none transition focus:border-[#c9973e] focus:ring-2 focus:ring-[#c9973e]/15"
                  >
                    <option value="Katherine">Katherine</option>
                    <option value="Laura">Laura</option>
                  </select>
                </div>
              </div>

              {/* PRODUCTO Y CANTIDAD */}
              <div className="grid grid-cols-[1fr_115px] gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d4d3b]">
                    Producto
                  </label>

                  <select
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    className="w-full rounded-2xl border border-[#d8d3ca] bg-[#fffefa] px-4 py-4 outline-none transition focus:border-[#c9973e] focus:ring-2 focus:ring-[#c9973e]/15"
                  >
                    <option value="">Seleccionar producto</option>

                    {productos.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d4d3b]">
                    Cantidad
                  </label>

                  <div className="flex h-[58px] items-center overflow-hidden rounded-2xl border border-[#d8d3ca] bg-[#fffefa]">
                    <button
                      type="button"
                      onClick={() => setCantidad((actual) => Math.max(1, actual - 1))}
                      className="h-full flex-1 text-xl text-gray-500 transition hover:bg-[#f7f1e4]"
                    >
                      −
                    </button>

                    <span className="min-w-[38px] text-center font-semibold text-[#0d4d3b]">
                      {cantidad}
                    </span>

                    <button
                      type="button"
                      onClick={() => setCantidad((actual) => actual + 1)}
                      className="h-full flex-1 text-xl text-gray-500 transition hover:bg-[#f7f1e4]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* AGREGAR */}
              <button
                onClick={agregarProducto}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c9973e] bg-white py-4 font-semibold text-[#0d4d3b] transition hover:bg-[#fbf7ed]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#0d4d3b] text-sm">
                  +
                </span>
                Agregar producto
              </button>

              {/* PRODUCTOS AGREGADOS */}
              {items.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-[#e4dfd6] bg-[#fffefa]">
                  <div className="border-b border-[#e4dfd6] bg-[#faf6ed] px-4 py-3">
                    <h2 className="font-semibold text-[#0d4d3b]">
                      Productos agregados
                    </h2>
                  </div>

                  {items.map((item, index) => (
                    <div
                      key={`${item.producto}-${index}`}
                      className="flex items-center justify-between border-b border-[#ece7df] px-4 py-4 last:border-b-0"
                    >
                      <span className="text-gray-800">{item.producto}</span>

                      <div className="flex items-center gap-4">
                        <span className="rounded-full bg-[#f2ecdf] px-3 py-1 text-sm font-semibold text-[#0d4d3b]">
                          {item.cantidad}
                        </span>

                        <button
                          onClick={() => eliminarProducto(index)}
                          className="text-xs font-medium text-red-500 transition hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="h-px bg-[#e5ded1]" />

              {/* GUARDAR */}
              <button
                onClick={guardarReporte}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#b98b32] bg-[#07523f] py-4 font-semibold text-white shadow-[0_8px_20px_rgba(7,82,63,0.20)] transition hover:bg-[#064634]"
              >
                <span>▣</span>
                Guardar reporte
              </button>
            </div>
          </section>
        )}

        {/* REPORTES */}
        {vista === "reportes" && (
          <section className="space-y-5 p-5 sm:p-7">
            <div>
              <h2 className="text-2xl font-semibold text-[#0d4d3b]">
                Reportes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Historial de hoy y ayer
              </p>
            </div>

            {cargando ? (
              <div className="rounded-2xl border border-[#e2ddd3] bg-white p-5 text-center text-gray-500">
                Cargando reportes...
              </div>
            ) : reportes.length === 0 ? (
              <div className="rounded-2xl border border-[#e2ddd3] bg-white p-6 text-center text-gray-500">
                No hay reportes de hoy ni de ayer.
              </div>
            ) : (
              reportes.map((reporte, index) => (
                <article
                  key={index}
                  className="overflow-hidden rounded-[24px] border border-[#e0dbd2] bg-white shadow-[0_8px_25px_rgba(60,45,20,0.07)]"
                >
                  <div className="bg-[#f7f1e4] px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <strong className="text-lg text-[#0d4d3b]">
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
                    <div className="grid grid-cols-[1fr_90px] border-b border-[#0d4d3b]/50 px-5 py-3 text-sm font-semibold text-[#0d4d3b]">
                      <span>Producto</span>
                      <span className="text-center">Cantidad</span>
                    </div>

                    {reporte.items.map((item, itemIndex) => (
                      <div
                        key={`${item.producto}-${itemIndex}`}
                        className="grid grid-cols-[1fr_90px] border-b border-[#ece7df] px-5 py-4 last:border-b-0"
                      >
                        <span className="text-gray-800">
                          {item.producto}
                        </span>

                        <span className="text-center font-semibold text-[#0d4d3b]">
                          {item.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {/* PIE */}
        <footer className="relative overflow-hidden bg-[#07523f] px-6 py-8 text-center text-white">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full border-2 border-white" />
            <div className="absolute -right-14 bottom-0 h-52 w-52 rounded-full border border-white" />
          </div>

          <div className="relative">
            <div className="mb-3 flex items-center justify-center gap-3 text-[#d3a34a]">
              <div className="h-px w-16 bg-[#d3a34a]" />
              <span>✦</span>
              <div className="h-px w-16 bg-[#d3a34a]" />
            </div>

            <p className="mx-auto max-w-xs font-serif text-sm italic leading-6 text-[#f6eedf]">
              Gracias por mantener nuestro estándar de excelencia.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}