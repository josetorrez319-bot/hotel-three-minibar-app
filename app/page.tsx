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

export default function Home() {
  const [vista, setVista] = useState<"registro" | "reportes">("registro");

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [villa, setVilla] = useState("Villa 01");
  const [colaborador, setColaborador] = useState("Katherine");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [items, setItems] = useState<Item[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [guardando, setGuardando] = useState(false);

  function obtenerHoyYAyer() {
    const hoy = new Date();

    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    const formato = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    return {
      hoy: formato(hoy),
      ayer: formato(ayer),
    };
  }

  async function cargarReportes() {
    const { hoy, ayer } = obtenerHoyYAyer();

    const { data, error } = await supabase
      .from("reportes")
      .select("*")
      .gte("fecha", ayer)
      .lte("fecha", hoy)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error al cargar reportes:", error);
      return;
    }

    const reportesConvertidos: Reporte[] = (data || []).map((reporte) => ({
      id: reporte.id,
      fecha: reporte.fecha,
      villa: reporte.villa,
      colaborador: reporte.colaborador,
      items: reporte.productos || [],
    }));

    setReportes(reportesConvertidos);
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
      actuales.filter((_, i) => i !== index)
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

  function aumentarCantidad() {
    setCantidad((actual) => actual + 1);
  }

  function disminuirCantidad() {
    setCantidad((actual) => Math.max(1, actual - 1));
  }

  return (
    <main className="min-h-screen bg-[#f5f2ea] p-0">
      <div
        className="
          mx-auto
          min-h-screen
          w-full
          max-w-xl
          overflow-hidden
          bg-[#fffdf8]
          shadow-[0_18px_45px_rgba(49,40,23,0.12)]
          sm:my-4
          sm:min-h-0
          sm:rounded-[26px]
          sm:border
          sm:border-[#e8dfce]
        "
      >
        {/* ENCABEZADO */}
        <header className="relative overflow-hidden border-b border-[#c4932f] bg-[#f8f3e8] px-5 py-5">
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border border-[#d8c49a]/30" />
          <div className="pointer-events-none absolute -right-2 top-10 h-40 w-40 rounded-full border border-[#d8c49a]/25" />

          <div className="relative flex items-center justify-center gap-5">
            <Image
              src="/logo.png"
              alt="Hotel Three Sixty Ojochal"
              width={105}
              height={105}
              className="h-auto w-[88px]"
              priority
            />

            <div className="h-24 w-px bg-[#c4932f]/70" />

            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-3 text-[#c4932f]">
                <span className="h-px w-7 bg-[#c4932f]" />
                <span className="text-lg">✦</span>
                <span className="h-px w-7 bg-[#c4932f]" />
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-6 bg-[#c4932f]" />

                <h1 className="text-[28px] font-medium tracking-[0.14em] text-[#0f4a37]">
                  MINIBAR
                </h1>

                <span className="h-px w-6 bg-[#c4932f]" />
              </div>

              <p className="mt-2 text-[10px] font-medium tracking-[0.28em] text-[#b9852d]">
                HOTEL THREE SIXTY
              </p>
            </div>
          </div>
        </header>

        {/* PESTAÑAS */}
        <div className="grid grid-cols-2 border-b border-[#ddd7cc] bg-white text-center">
          <button
            onClick={() => setVista("registro")}
            className={`relative px-3 py-4 text-base font-semibold ${
              vista === "registro"
                ? "text-[#0f4a37]"
                : "text-gray-500"
            }`}
          >
            <span className="mr-2 text-[#c4932f]">▣</span>
            Nuevo registro

            {vista === "registro" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#0f4a37]" />
            )}
          </button>

          <button
            onClick={() => {
              setVista("reportes");
              cargarReportes();
            }}
            className={`relative px-3 py-4 text-base font-semibold ${
              vista === "reportes"
                ? "text-[#0f4a37]"
                : "text-gray-500"
            }`}
          >
            <span className="mr-2">▥</span>
            Reportes

            {vista === "reportes" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#0f4a37]" />
            )}
          </button>
        </div>

        {/* NUEVO REGISTRO */}
        {vista === "registro" && (
          <>
            <section className="bg-[#fbfaf6] px-4 py-4">
              <div className="space-y-4 rounded-[24px] border border-[#e5dfd3] bg-white p-4 shadow-sm">
                {/* FECHA */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#174f3c]">
                    Fecha
                  </label>

                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full rounded-2xl border border-[#d9d4ca] bg-[#fffefa] px-4 py-3 text-base outline-none focus:border-[#c4932f]"
                  />
                </div>

                {/* VILLA Y COLABORADOR */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#174f3c]">
                      Villa
                    </label>

                    <select
                      value={villa}
                      onChange={(e) => setVilla(e.target.value)}
                      className="w-full rounded-2xl border border-[#d9d4ca] bg-[#fffefa] px-3 py-3 text-base outline-none"
                    >
                      {villas.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#174f3c]">
                      Colaborador
                    </label>

                    <select
                      value={colaborador}
                      onChange={(e) => setColaborador(e.target.value)}
                      className="w-full rounded-2xl border border-[#d9d4ca] bg-[#fffefa] px-3 py-3 text-base outline-none"
                    >
                      <option value="Katherine">Katherine</option>
                      <option value="Laura">Laura</option>
                    </select>
                  </div>
                </div>

                {/* PRODUCTO Y CANTIDAD */}
                <div className="grid grid-cols-[1fr_110px] gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#174f3c]">
                      Producto
                    </label>

                    <select
                      value={producto}
                      onChange={(e) => setProducto(e.target.value)}
                      className="w-full rounded-2xl border border-[#d9d4ca] bg-[#fffefa] px-3 py-3 text-base outline-none"
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
                    <label className="mb-2 block text-center text-sm font-bold text-[#174f3c]">
                      Cantidad
                    </label>

                    <div className="flex h-[50px] items-center justify-between rounded-2xl border border-[#d9d4ca] bg-[#fffefa] px-3">
                      <button
                        type="button"
                        onClick={disminuirCantidad}
                        className="text-xl font-semibold text-gray-500"
                      >
                        −
                      </button>

                      <span className="text-lg font-bold text-[#174f3c]">
                        {cantidad}
                      </span>

                      <button
                        type="button"
                        onClick={aumentarCantidad}
                        className="text-xl font-semibold text-gray-500"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={agregarProducto}
                  className="w-full rounded-2xl border border-[#c4932f] bg-white py-3 text-base font-bold text-[#174f3c]"
                >
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#174f3c]">
                    +
                  </span>
                  Agregar producto
                </button>

                {/* PRODUCTOS AGREGADOS */}
                {items.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-[#e3ded4]">
                    <div className="bg-[#f8f3e8] px-4 py-2">
                      <h2 className="text-sm font-bold text-[#174f3c]">
                        Productos agregados
                      </h2>
                    </div>

                    {items.map((item, index) => (
                      <div
                        key={`${item.producto}-${index}`}
                        className="flex items-center justify-between border-t border-[#eee9df] px-4 py-2"
                      >
                        <span className="text-sm">{item.producto}</span>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#174f3c]">
                            {item.cantidad}
                          </span>

                          <button
                            onClick={() => eliminarProducto(index)}
                            className="text-xs font-semibold text-red-500"
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
                  disabled={guardando || items.length === 0}
                  className="w-full rounded-2xl border border-[#c4932f] bg-[#1d5945] py-3 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ▣ {guardando ? "Guardando..." : "Guardar reporte"}
                </button>
              </div>
            </section>

            {/* PIE */}
            <footer className="bg-[#1d5945] px-5 py-5 text-center text-[#f7f0df]">
              <div className="mb-2 flex items-center justify-center gap-3 text-[#c99a45]">
                <span className="h-px w-12 bg-[#c99a45]" />
                <span>✦</span>
                <span className="h-px w-12 bg-[#c99a45]" />
              </div>

              <p className="font-serif text-sm font-semibold italic">
                Gracias por mantener nuestro estándar de excelencia.
              </p>
            </footer>
          </>
        )}

        {/* REPORTES */}
        {vista === "reportes" && (
          <section className="min-h-[500px] space-y-4 bg-[#fbfaf6] p-5">
            <div>
              <h2 className="text-xl font-bold text-[#174f3c]">
                Reportes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Historial de hoy y ayer
              </p>
            </div>

            {reportes.length === 0 ? (
              <div className="rounded-2xl border border-[#ddd7cc] bg-white p-5 text-center text-gray-500">
                Aún no hay reportes guardados de hoy ni de ayer.
              </div>
            ) : (
              reportes.map((reporte, index) => (
                <div
                  key={reporte.id ?? index}
                  className="overflow-hidden rounded-2xl border border-[#e1ddd5] bg-white"
                >
                  <div className="bg-[#f8f3e8] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#174f3c]">
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

                  <div className="grid grid-cols-[1fr_80px] border-b border-[#174f3c] px-4 py-2 text-sm font-bold text-[#174f3c]">
                    <span>Producto</span>
                    <span className="text-center">Cantidad</span>
                  </div>

                  {reporte.items.map((item, itemIndex) => (
                    <div
                      key={`${item.producto}-${itemIndex}`}
                      className="grid grid-cols-[1fr_80px] border-b border-[#eee9df] px-4 py-3 last:border-b-0"
                    >
                      <span>{item.producto}</span>

                      <span className="text-center font-bold">
                        {item.cantidad}
                      </span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </section>
        )}
      </div>
    </main>
  );
}