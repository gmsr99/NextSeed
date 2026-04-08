import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlanActions } from "../PlanActions";

const defaultProps = {
  planId: null,
  saving: false,
  sending: false,
  sent: false,
  onBack: vi.fn(),
  onSave: vi.fn(),
  onDownload: vi.fn(),
  onSendEmail: vi.fn(),
};

describe("PlanActions", () => {
  it("mostra 'Editar' quando planId é null", () => {
    render(<PlanActions {...defaultProps} planId={null} />);
    expect(screen.getByText("Editar")).toBeInTheDocument();
  });

  it("mostra 'Regenerar' quando planId existe", () => {
    render(<PlanActions {...defaultProps} planId="abc-123" />);
    expect(screen.getByText("Regenerar")).toBeInTheDocument();
  });

  it("mostra 'Guardar' quando planId é null", () => {
    render(<PlanActions {...defaultProps} planId={null} />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("mostra 'Atualizar' quando planId existe", () => {
    render(<PlanActions {...defaultProps} planId="abc-123" />);
    expect(screen.getByText("Atualizar")).toBeInTheDocument();
  });

  it("chama onBack quando o botão de editar é clicado", () => {
    const onBack = vi.fn();
    render(<PlanActions {...defaultProps} onBack={onBack} />);
    fireEvent.click(screen.getByText("Editar"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("chama onSave quando o botão guardar é clicado", () => {
    const onSave = vi.fn();
    render(<PlanActions {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByText("Guardar"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("chama onDownload quando o botão de descarregar é clicado", () => {
    const onDownload = vi.fn();
    render(<PlanActions {...defaultProps} onDownload={onDownload} />);
    fireEvent.click(screen.getByText("Descarregar PDFs"));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("chama onSendEmail quando o botão de email é clicado", () => {
    const onSendEmail = vi.fn();
    render(<PlanActions {...defaultProps} onSendEmail={onSendEmail} />);
    fireEvent.click(screen.getByText("Enviar por Email"));
    expect(onSendEmail).toHaveBeenCalledTimes(1);
  });

  it("botão Guardar fica desativado durante saving=true", () => {
    render(<PlanActions {...defaultProps} saving={true} />);
    const saveBtn = screen.getByText("Guardar").closest("button");
    expect(saveBtn).toBeDisabled();
  });

  it("botão de email fica desativado durante sending=true", () => {
    render(<PlanActions {...defaultProps} sending={true} />);
    const emailBtn = screen.getByRole("button", { name: /enviar/i });
    expect(emailBtn).toBeDisabled();
  });

  it("mostra 'Email enviado!' quando sent=true", () => {
    render(<PlanActions {...defaultProps} sent={true} />);
    expect(screen.getByText("Email enviado!")).toBeInTheDocument();
  });

  it("botão de email fica desativado quando sent=true", () => {
    render(<PlanActions {...defaultProps} sent={true} />);
    const sentBtn = screen.getByText("Email enviado!").closest("button");
    expect(sentBtn).toBeDisabled();
  });
});
