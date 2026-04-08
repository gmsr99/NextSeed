import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VersionBadge } from "../VersionBadge";
import type { VersionBadgeProps } from "../VersionBadge";

const makeHistory = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `v${count - i}`,
    version: count - i,
    generated_at: `2025-01-${String(10 + i).padStart(2, "0")}T10:00:00Z`,
  }));

const defaultProps: VersionBadgeProps = {
  version: 2,
  history: makeHistory(2),
  isUnsaved: false,
  onRestore: vi.fn().mockResolvedValue(undefined),
};

describe("VersionBadge", () => {
  describe("estado isUnsaved", () => {
    it("mostra aviso de não guardado quando isUnsaved=true", () => {
      render(<VersionBadge {...defaultProps} isUnsaved={true} />);
      expect(screen.getByText(/ainda não guardado/i)).toBeInTheDocument();
    });

    it("não mostra badge de versão quando isUnsaved=true", () => {
      render(<VersionBadge {...defaultProps} isUnsaved={true} />);
      expect(screen.queryByText(/Versão/)).not.toBeInTheDocument();
    });
  });

  describe("sem histórico", () => {
    it("não renderiza nada quando history está vazio", () => {
      const { container } = render(
        <VersionBadge {...defaultProps} history={[]} isUnsaved={false} />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("com histórico de uma versão", () => {
    it("mostra o número de versão correto", () => {
      render(
        <VersionBadge
          {...defaultProps}
          version={1}
          history={makeHistory(1)}
          isUnsaved={false}
        />,
      );
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("não mostra 'de X' quando há apenas uma versão", () => {
      render(
        <VersionBadge
          {...defaultProps}
          version={1}
          history={makeHistory(1)}
          isUnsaved={false}
        />,
      );
      expect(screen.queryByText(/de \d+/)).not.toBeInTheDocument();
    });
  });

  describe("com múltiplas versões", () => {
    it("mostra 'Versão X de Y' com múltiplas versões", () => {
      render(<VersionBadge {...defaultProps} version={2} history={makeHistory(3)} />);
      expect(screen.getByText(/de 3/)).toBeInTheDocument();
    });

    it("abre dropdown ao clicar no badge", () => {
      render(<VersionBadge {...defaultProps} />);
      const badge = screen.getByRole("button");
      fireEvent.click(badge);
      expect(screen.getByText("Histórico de versões")).toBeInTheDocument();
    });

    it("fecha dropdown ao clicar fora", () => {
      render(
        <div>
          <VersionBadge {...defaultProps} />
          <span data-testid="outside">fora</span>
        </div>,
      );
      const badge = screen.getByRole("button");
      fireEvent.click(badge);
      expect(screen.getByText("Histórico de versões")).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByTestId("outside"));
      expect(screen.queryByText("Histórico de versões")).not.toBeInTheDocument();
    });

    it("marca a versão atual como 'Atual'", () => {
      render(<VersionBadge {...defaultProps} version={2} history={makeHistory(2)} />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByText("Atual")).toBeInTheDocument();
    });

    it("versões mais antigas mostram botão 'Restaurar'", () => {
      render(<VersionBadge {...defaultProps} version={2} history={makeHistory(2)} />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByText("Restaurar")).toBeInTheDocument();
    });

    it("chama onRestore com o id correto ao restaurar", async () => {
      const onRestore = vi.fn().mockResolvedValue(undefined);
      render(
        <VersionBadge
          {...defaultProps}
          version={2}
          history={makeHistory(2)}
          onRestore={onRestore}
        />,
      );
      fireEvent.click(screen.getByRole("button")); // abre dropdown
      fireEvent.click(screen.getByText("Restaurar"));
      await waitFor(() => expect(onRestore).toHaveBeenCalledWith("v1"));
    });

    it("fecha dropdown após restaurar", async () => {
      const onRestore = vi.fn().mockResolvedValue(undefined);
      render(
        <VersionBadge
          {...defaultProps}
          version={2}
          history={makeHistory(2)}
          onRestore={onRestore}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByText("Restaurar"));
      await waitFor(() =>
        expect(screen.queryByText("Histórico de versões")).not.toBeInTheDocument(),
      );
    });
  });
});
