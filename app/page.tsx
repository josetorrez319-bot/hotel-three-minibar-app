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
    <main className="min-h-screen bg-[#f5f2ea] px-2 py-3">
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-[26px] border border-[#e8dfce] bg-[#fffdf8] shadow-[0_18px_45px_rgba(49,40,23,0.12)]">

        {/* ENCABEZADO COMPACTO */}
        <header className="relative overflow-hidden border-b border-[#c9973e] bg-[#f7f1e4] px-4 py-5">
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full border border-[#d8c7a4]/25" />
          <div className="pointer-events-none absolute right-4 top-8 h-24 w-24 rounded-full border border-[#d8c7a4]/20" />

          <div className="relative flex items-center justify-center gap-5">
            <div className="flex w-[92px] justify-center">
              <Image
                src="/logo.png"
                alt="Hotel Three Sixty Ojochal"
                width={100}
                height={100}
                className="h-auto w-[92px]"
                priority
              />
            </div>

            <div className="h-20 w-px bg-[#c9973e]" />

            <div className="flex flex-col items-center">
              <div className="mb-1.5 flex items-center gap-2">
                <div className="h-px w-5 bg-[#c9973e]" />
                <span className="text-xs text-[#c9973e]">✦</span>
                <div className="h-px w-5 bg-[#c9973e]" />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px w-5 bg-[#c9973e]" />

                <h1 className="text-2xl font-medium tracking-[0.15em] text-[#0d4d3b]">
                  MINIBAR
                </h1>

                <div className="h-px w-5 bg-[#c9973e]" />
              </div>

              <p className="mt-1.5 text-[8px] font-medium tracking-[0.3em] text-[#b78631]">
                HOTEL THREE SIXTY
              </p>
            </div>
          </div>
        </header>

        {/* PESTAÑAS COMPACTAS */}
        <div className="grid grid-cols-2 border-b border-[#ddd6c9] bg-white">
          <button
            onClick={() => setVista("registro")}
            className={`relative flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold transition ${
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
            className={`relative flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold transition ${
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
          <section className="p-3">
            <div className="space-y-4 rounded-[22px] border border-[#ebe5da] bg-white p-4 shadow-[0_7px_24px_rgba(64,48,20,0.06)]">

              {/* FECHA */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0d4d3b]">
                  Fecha
                </label>

                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-xl border border-[#d8d3ca] bg-[#fffefa] px-3 py-3 text-sm text-gray-800 outline-none transition focus:border-[#c9973e] focus:ring-2 focus:ring-[#c9973e]/15"
                />
              </div>

              {/* VILLA Y COLABORADOR */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0d4d3b]">
                    Villa
                  </label>

                  <select
                    value={villa}
                    onChange={(e) => setVilla(e.target.value)}
                    className="w-full rounded-xl border border-[#d8d3ca] bg-[#fffefa] px-3 py-3 text-sm outline-none transition focus:border-[#c9973e] focus:ring-2 focus:ring-[#c9973e]/15"
                  >
                    {villas.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0d4d3b]">
                    Colaborador
                  </label>

                  <select
                    value={colaborador}
                    onChange={(e) => setColaborador(e.target.value)}
                    className="w-full rounded-xl border border-[#d8d3ca] bg-[#fffefa] px-3 py-3 text-sm outline-none transition focus:border-[#c9973e] focus:ring-2 focus:ring-[#c9973e]/15"
                  >
                    <option value="Katherine">Katherine</option>
                    <option value="Laura">Laura</option>
                  </select>
                </div>
              </div>

              {/* PRODUCTO Y CANTIDAD */}
              <div className="grid grid-cols-[1fr_105px] gap-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0d4d3b]">
                    Producto
                  </label>

                  <select
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    className="w-full rounded-xl border border-[#d8d3ca] bg-[#fffefa] px-3 py-3 text-sm outline-none transition focus:border-[#c9973e] focus:ring-2 focus:ring-[#c9973e]/15"
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
                  <label className="mb-1 block text-sm font-semibold text-[#0d4d3b]">
                    Cantidad
                  </label>

                  <div className="flex h-[46px] items-center overflow-hidden rounded-xl border border-[#d8d3ca] bg-[#fffefa]">
                    <button
                      type="button"
                      onClick={() =>
                        setCantidad((actual) => Math.max(1, actual - 1))
                      }
                      className="h-full flex-1 text-lg text-gray-500 transition hover:bg-[#f7f1e4]"
                    >
                      −
                    </button>

                    <span className="min-w-[30px] text-center text-sm font-semibold text-[#0d4d3b]">
                      {cantidad}
                    </span>

                    <button
                      type="button"
                      onClick={() => setCantidad((actual) => actual + 1)}
                      className="h-full flex-1 text-lg text-gray-500 transition hover:bg-[#f7f1e4]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* AGREGAR */}
              <button
                onClick={agregarProducto}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#c9973e] bg-white py-3 text-sm font-semibold text-[#0d4d3b] transition hover:bg-[#fbf7ed]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0d4d3b] text-xs">
                  +
                </span>
                Agregar producto
              </button>

              {/* PRODUCTOS AGREGADOS */}
              {items.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-[#e4dfd6] bg-[#fffefa]">
                  <div className="border-b border-[#e4dfd6] bg-[#faf6ed] px-3 py-2">
                    <h2 className="text-sm font-semibold text-[#0d4d3b]">
                      Productos agregados
                    </h2>
                  </div>

                  {items.map((item, index) => (
                    <div
                      key={`${item.producto}-${index}`}
                      className="flex items-center justify-between border-b border-[#ece7df] px-3 py-2 last:border-b-0"
                    >
                      <span className="text-sm text-gray-800">
                        {item.producto}
                      </span>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[#f2ecdf] px-2.5 py-1 text-xs font-semibold text-[#0d4d3b]">
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

              {/* GUARDAR */}
              <button
                onClick={guardarReporte}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#b98b32] bg-[#07523f] py-3 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(7,82,63,0.18)] transition hover:bg-[#064634]"
              >
                <span>▣</span>
                Guardar reporte
              </button>
            </div>
          </section>
        )}

        {/* REPORTES */}
        {vista === "reportes" && (
          <section className="space-y-4 p-4">
            <div>
              <h2 className="text-xl font-semibold text-[#0d4d3b]">
                Reportes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Historial de hoy y ayer
              </p>
            </div>

            {cargando ? (
              <div className="rounded-xl border border-[#e2ddd3] bg-white p-4 text-center text-gray-500">
                Cargando reportes...
              </div>
            ) : reportes.length === 0 ? (
              <div className="rounded-xl border border-[#e2ddd3] bg-white p-4 text-center text-gray-500">
                No hay reportes de hoy ni de ayer.
              </div>
            ) : (
              reportes.map((reporte, index) => (
                <article
                  key={index}
                  className="overflow-hidden rounded-[20px] border border-[#e0dbd2] bg-white shadow-[0_7px_22px_rgba(60,45,20,0.06)]"
                >
                  <div className="bg-[#f7f1e4] px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <strong className="text-base text-[#0d4d3b]">
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
                    <div className="grid grid-cols-[1fr_80px] border-b border-[#0d4d3b]/50 px-4 py-2 text-sm font-semibold text-[#0d4d3b]">
                      <span>Producto</span>
                      <span className="text-center">Cantidad</span>
                    </div>

                    {reporte.items.map((item, itemIndex) => (
                      <div
                        key={`${item.producto}-${itemIndex}`}
                        className="grid grid-cols-[1fr_80px] border-b border-[#ece7df] px-4 py-3 last:border-b-0"
                      >
                        <span className="text-sm text-gray-800">
                          {item.producto}
                        </span>

                        <span className="text-center text-sm font-semibold text-[#0d4d3b]">
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

        {/* PIE COMPACTO */}
        <footer className="relative overflow-hidden bg-[#07523f] px-5 py-5 text-center text-white">
          <div className="relative">
            <div className="mb-2 flex items-center justify-center gap-3 text-[#d3a34a]">
              <div className="h-px w-12 bg-[#d3a34a]" />
              <span className="text-xs">✦</span>
              <div className="h-px w-12 bg-[#d3a34a]" />
            </div>

            <p className="mx-auto max-w-xs font-serif text-xs italic leading-5 text-[#f6eedf]">
              Gracias por mantener nuestro estándar de excelencia.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}