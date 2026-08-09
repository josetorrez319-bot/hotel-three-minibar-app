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
  id?: number;
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

function mostrarFecha(fecha: string) {
  if (!fecha) return "";

  return new Date(fecha + "T00:00:00").toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Home() {
  const [vista, setVista] =
    useState<"registro" | "reportes">("registro");

  const [fecha, setFecha] = useState(fechaLocal(new Date()));
  const [villa, setVilla] = useState("Villa 01");
  const [colaborador, setColaborador] = useState("Katherine");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [items, setItems] = useState<Item[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);

  function obtenerHoyYAyer() {
    const hoy = new Date();

    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    return {
      hoy: fechaLocal(hoy),
      ayer: fechaLocal(ayer),
    };
  }

  async function cargarReportes() {
    setCargando(true);

    const { hoy, ayer } = obtenerHoyYAyer();

    const { data, error } = await supabase
      .from("reportes")
      .select("*")
      .gte("fecha", ayer)
      .lte("fecha", hoy)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error al cargar reportes:", error);
      setCargando(false);
      return;
    }

    const reportesFormateados: Reporte[] = (data || []).map(
      (reporte) => ({
        id: reporte.id,
        fecha: reporte.fecha,
        villa: reporte.villa,
        colaborador: reporte.colaborador,
        items: reporte.productos || [],
      })
    );

    setReportes(reportesFormateados);
    setCargando(false);
  }

  useEffect(() => {
    cargarReportes();
  }, []);

  function agregarProducto() {
    if (!producto || cantidad < 1) return;

    setItems((actuales) => [
      ...actuales,
      {
        producto,
        cantidad,
      },
    ]);

    setProducto("");
    setCantidad(1);
  }

  function eliminarProducto(index: number) {
    setItems((actuales) =>
      actuales.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function guardarReporte() {
    if (items.length === 0 || guardando) return;

    setGuardando(true);

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
      setGuardando(false);
      return;
    }

    setItems([]);
    setProducto("");
    setCantidad(1);

    await cargarReportes();

    setVista("reportes");
    setGuardando(false);
  }

  async function abrirReportes() {
    setVista("reportes");
    await cargarReportes();
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec]">
      <div className="mx-auto min-h-screen w-full max-w-[820px] overflow-hidden bg-[#fffdf8] shadow-xl">

        {/* ENCABEZADO */}
        <header className="relative overflow-hidden border-b border-[#c4932f] bg-[#f8f3e8] px-5 py-5">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-[#c4932f]/15" />

          <div className="relative flex items-center justify-center gap-5">
            <div className="flex w-[105px] items-center justify-center">
              <Image
                src="/logo.png"
                alt="Hotel Three Sixty Ojochal"
                width={105}
                height={105}
                className="h-auto w-[95px] object-contain"
                priority
              />
            </div>

            <div className="h-24 w-px bg-[#c4932f]" />

            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="mb-2 flex items-center gap-3">
                <div className="h-px w-8 bg-[#c4932f]" />
                <span className="text-[#c4932f]">✦</span>
                <div className="h-px w-8 bg-[#c4932f]" />
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-6 bg-[#c4932f]" />

                <h1 className="text-[clamp(1.8rem,7vw,3.2rem)] font-medium tracking-[0.12em] text-[#174f3d]">
                  MINIBAR
                </h1>

                <div className="h-px w-6 bg-[#c4932f]" />
              </div>

              <p className="mt-2 text-center text-[9px] tracking-[0.3em] text-[#b9852c] sm:text-xs">
                HOTEL THREE SIXTY
              </p>
            </div>
          </div>
        </header>

        {/* PESTAÑAS */}
        <div className="grid grid-cols-2 border-b border-[#ddd8ce] bg-white">
          <button
            type="button"
            onClick={() => setVista("registro")}
            className={`relative px-2 py-4 text-sm font-bold sm:text-base ${
              vista === "registro"
                ? "text-[#174f3d]"
                : "text-gray-500"
            }`}
          >
            <span className="mr-2 text-[#c4932f]">▣</span>
            Nuevo registro

            {vista === "registro" && (
              <span className="absolute bottom-0 left-0 h-[4px] w-full bg-[#174f3d]" />
            )}
          </button>

          <button
            type="button"
            onClick={abrirReportes}
            className={`relative px-2 py-4 text-sm font-bold sm:text-base ${
              vista === "reportes"
                ? "text-[#174f3d]"
                : "text-gray-500"
            }`}
          >
            <span className="mr-2">▥</span>
            Reportes

            {vista === "reportes" && (
              <span className="absolute bottom-0 left-0 h-[4px] w-full bg-[#174f3d]" />
            )}
          </button>
        </div>

        {/* NUEVO REGISTRO */}
        {vista === "registro" && (
          <section className="p-4">
            <div className="w-full overflow-hidden rounded-[28px] border border-[#e2ddd3] bg-white p-4 shadow-sm sm:p-5">

              {/* FECHA */}
              <div className="w-full">
                <label className="mb-2 block text-sm font-bold text-[#174f3d]">
                  Fecha
                </label>

                <div className="relative h-[54px] w-full overflow-hidden rounded-2xl border border-[#d8d2c7] bg-[#fffdf9]">

                  {/* FECHA CENTRADA */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-12 text-center text-base font-medium text-gray-900">
                    {mostrarFecha(fecha)}
                  </div>

                  {/* ICONO */}
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-600">
                    ▣
                  </div>

                  {/* INPUT REAL INVISIBLE */}
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Seleccionar fecha"
                  />
                </div>
              </div>

              {/* VILLA Y COLABORADOR */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-bold text-[#174f3d]">
                    Villa
                  </label>

                  <select
                    value={villa}
                    onChange={(e) => setVilla(e.target.value)}
                    className="h-[54px] w-full rounded-2xl border border-[#d8d2c7] bg-[#fffdf9] px-3 text-center text-base outline-none"
                  >
                    {villas.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-bold text-[#174f3d]">
                    Colaborador
                  </label>

                  <select
                    value={colaborador}
                    onChange={(e) => setColaborador(e.target.value)}
                    className="h-[54px] w-full rounded-2xl border border-[#d8d2c7] bg-[#fffdf9] px-3 text-center text-base outline-none"
                  >
                    <option value="Katherine">Katherine</option>
                    <option value="Laura">Laura</option>
                  </select>
                </div>
              </div>

              {/* PRODUCTO Y CANTIDAD */}
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_105px] gap-3">
                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-bold text-[#174f3d]">
                    Producto
                  </label>

                  <select
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    className="h-[54px] w-full rounded-2xl border border-[#d8d2c7] bg-[#fffdf9] px-3 text-center text-base outline-none"
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
                  <label className="mb-2 block text-center text-sm font-bold text-[#174f3d]">
                    Cantidad
                  </label>

                  <div className="grid h-[54px] grid-cols-3 items-center overflow-hidden rounded-2xl border border-[#d8d2c7] bg-[#fffdf9]">
                    <button
                      type="button"
                      onClick={() =>
                        setCantidad((actual) =>
                          Math.max(1, actual - 1)
                        )
                      }
                      className="flex h-full items-center justify-center text-xl text-gray-500"
                    >
                      −
                    </button>

                    <span className="flex h-full items-center justify-center text-center text-lg font-bold text-[#174f3d]">
                      {cantidad}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setCantidad((actual) => actual + 1)
                      }
                      className="flex h-full items-center justify-center text-xl text-gray-500"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* AGREGAR PRODUCTO */}
              <button
                type="button"
                onClick={agregarProducto}
                disabled={!producto}
                className="mt-5 flex h-[56px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#c4932f] bg-white text-base font-bold text-[#174f3d] disabled:opacity-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#174f3d]">
                  +
                </span>
                Agregar producto
              </button>

              {/* PRODUCTOS AGREGADOS */}
              {items.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#e2ddd3]">
                  <div className="bg-[#f8f3e8] px-4 py-3">
                    <h2 className="font-bold text-[#174f3d]">
                      Productos agregados
                    </h2>
                  </div>

                  {items.map((item, index) => (
                    <div
                      key={`${item.producto}-${index}`}
                      className="flex items-center justify-between border-t border-[#eee9df] px-4 py-3"
                    >
                      <span>{item.producto}</span>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-[#174f3d]">
                          {item.cantidad}
                        </span>

                        <button
                          type="button"
                          onClick={() => eliminarProducto(index)}
                          className="text-sm font-semibold text-red-500"
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
                type="button"
                onClick={guardarReporte}
                disabled={items.length === 0 || guardando}
                className="mt-5 flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl border border-[#c4932f] bg-[#174f3d] text-base font-bold text-white disabled:bg-[#adc2ba]"
              >
                <span>▣</span>
                {guardando ? "Guardando..." : "Guardar reporte"}
              </button>
            </div>
          </section>
        )}

        {/* REPORTES */}
        {vista === "reportes" && (
          <section className="p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#174f3d]">
                Reportes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Historial de hoy y ayer
              </p>
            </div>

            {cargando ? (
              <div className="rounded-2xl border bg-white p-6 text-center text-gray-500">
                Cargando reportes...
              </div>
            ) : reportes.length === 0 ? (
              <div className="rounded-2xl border bg-white p-6 text-center text-gray-500">
                Aún no hay reportes de hoy o ayer.
              </div>
            ) : (
              <div className="space-y-4">
                {reportes.map((reporte, index) => (
                  <div
                    key={reporte.id ?? index}
                    className="overflow-hidden rounded-2xl border border-[#e2ddd3] bg-white"
                  >
                    <div className="bg-[#f8f3e8] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#174f3d]">
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

                    <div className="grid grid-cols-[1fr_85px] border-b px-4 py-2 text-sm font-bold text-[#174f3d]">
                      <span>Producto</span>
                      <span className="text-center">Cantidad</span>
                    </div>

                    {reporte.items.map((item, itemIndex) => (
                      <div
                        key={`${item.producto}-${itemIndex}`}
                        className="grid grid-cols-[1fr_85px] border-b px-4 py-3 last:border-b-0"
                      >
                        <span>{item.producto}</span>

                        <span className="text-center font-bold">
                          {item.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* PIE */}
        <footer className="bg-[#174f3d] px-5 py-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[#c4932f]" />
            <span className="text-[#c4932f]">✦</span>
            <div className="h-px w-12 bg-[#c4932f]" />
          </div>

          <p className="font-serif text-sm font-semibold italic text-[#f8f3e8]">
            Gracias por mantener nuestro estándar de excelencia.
          </p>
        </footer>
      </div>
    </main>
  );
}