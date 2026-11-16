import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from pathlib import Path

def create_system_architecture_diagram(output_path: str = "docs/images/system_architecture.png"):
    # Set high-resolution figure (1920x1300 at 200 DPI)
    fig, ax = plt.subplots(figsize=(16, 11), dpi=200)
    fig.patch.set_facecolor("#f8fafc") # Clean slate-50 background
    ax.set_facecolor("#f8fafc")

    # Remove standard axes
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")

    # Header / Title Banner
    ax.text(
        50, 96.5,
        "OncoMatch — End-to-End System Architecture",
        ha="center", va="center",
        fontsize=22, fontweight="bold",
        color="#0f172a", fontfamily="sans-serif"
    )
    ax.text(
        50, 93.8,
        "Decoupled, Type-Safe Precision Oncology AI & Pharmacogenomic Sensitivity Platform",
        ha="center", va="center",
        fontsize=12, color="#64748b", fontfamily="sans-serif"
    )

    # Helper function to draw rounded boxes
    def draw_card(x, y, w, h, bg_color, border_color, border_width=1.8, radius=1.8):
        box = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle=patches.BoxStyle("Round", pad=radius, rounding_size=radius),
            facecolor=bg_color,
            edgecolor=border_color,
            linewidth=border_width,
            zorder=2
        )
        ax.add_patch(box)
        return box

    # Helper function to draw inner item boxes
    def draw_item(x, y, w, h, text, subtext="", badge="", bg="#ffffff", border="#cbd5e1", text_color="#1e293b"):
        box = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle=patches.BoxStyle("Round", pad=0.8, rounding_size=0.8),
            facecolor=bg,
            edgecolor=border,
            linewidth=1.2,
            zorder=3
        )
        ax.add_patch(box)
        if subtext:
            ax.text(x + w/2, y + h*0.62, text, ha="center", va="center", fontsize=9.5, fontweight="bold", color=text_color, zorder=4)
            ax.text(x + w/2, y + h*0.30, subtext, ha="center", va="center", fontsize=8.0, color="#64748b", zorder=4)
        else:
            ax.text(x + w/2, y + h*0.50, text, ha="center", va="center", fontsize=9.5, fontweight="bold", color=text_color, zorder=4)
        
        if badge:
            badge_box = patches.FancyBboxPatch(
                (x + w - 8.5, y + h - 2.8), 7.5, 2.2,
                boxstyle=patches.BoxStyle("Round", pad=0.4, rounding_size=0.4),
                facecolor="#e0f2fe", edgecolor="#0284c7", linewidth=0.8, zorder=5
            )
            ax.add_patch(badge_box)
            ax.text(x + w - 4.75, y + h - 1.7, badge, ha="center", va="center", fontsize=6.8, fontweight="bold", color="#0369a1", zorder=6)

    # -------------------------------------------------------------
    # 1. CLIENT BROWSER TIER (Top)
    # -------------------------------------------------------------
    draw_card(4, 62, 92, 28, bg_color="#f0fdfa", border_color="#0d9488", border_width=2.0)
    # Title badge
    client_badge = patches.FancyBboxPatch((6, 86.5), 38, 3.2, boxstyle="Round,pad=0.5,rounding_size=0.5", facecolor="#0d9488", edgecolor="#0f766e", zorder=4)
    ax.add_patch(client_badge)
    ax.text(25, 88.1, "CLIENT BROWSER (React 18 + TypeScript + Vite + Tailwind)", ha="center", va="center", fontsize=10.5, fontweight="bold", color="#ffffff", zorder=5)

    # Client components
    draw_item(6, 65, 16.5, 18, "Tailwind Modern UI", "Design System & Theme", bg="#ffffff", border="#99f6e4", text_color="#0f766e")
    draw_item(24.5, 65, 16.5, 18, "Active Profile Bar", "COSMIC Lineage Context", bg="#ffffff", border="#99f6e4", text_color="#0f766e")
    draw_item(43, 65, 16.5, 18, "Master-Detail 4PL", "Sigmoidal Dose Workspace", bg="#ffffff", border="#99f6e4", text_color="#0f766e")
    draw_item(61.5, 65, 16.5, 18, "Comparison Drawer", "Docked Pinboard Multi-Curve", bg="#ffffff", border="#99f6e4", text_color="#0f766e")
    draw_item(80, 65, 14.5, 18, "In-Memory Cache", "Sub-1ms Tier Switching", bg="#ccfbf1", border="#14b8a6", text_color="#115e59")

    # Internal Client Arrow
    ax.annotate("", xy=(80, 74), xytext=(78, 74),
                arrowprops=dict(arrowstyle="->", color="#0d9488", lw=2.0, mutation_scale=14), zorder=6)

    # -------------------------------------------------------------
    # 2. BACKEND APPLICATION SERVER (Middle)
    # -------------------------------------------------------------
    draw_card(4, 34, 92, 22, bg_color="#f8fafc", border_color="#4f46e5", border_width=2.0)
    server_badge = patches.FancyBboxPatch((6, 52.8), 34, 3.0, boxstyle="Round,pad=0.5,rounding_size=0.5", facecolor="#4f46e5", edgecolor="#4338ca", zorder=4)
    ax.add_patch(server_badge)
    ax.text(23, 54.3, "BACKEND SERVER (FastAPI 0.110 + Uvicorn Async)", ha="center", va="center", fontsize=10.5, fontweight="bold", color="#ffffff", zorder=5)

    # Router + Routes
    draw_item(6, 37, 16.5, 13, "API Router (/api)", "Async Request Gateway", bg="#eef2ff", border="#818cf8", text_color="#3730a3")
    draw_item(24.5, 37, 16.5, 13, "Predict Routes", "/api/predict & /all", bg="#ffffff", border="#c7d2fe", text_color="#312e81")
    draw_item(43, 37, 16.5, 13, "Sample Routes", "/api/samples & /upload", bg="#ffffff", border="#c7d2fe", text_color="#312e81")
    draw_item(61.5, 37, 16.5, 13, "Analytics Routes", "/api/pca & /heatmap", bg="#ffffff", border="#c7d2fe", text_color="#312e81")
    draw_item(80, 37, 14.5, 13, "Report Routes", "/generate & /download", bg="#ffffff", border="#c7d2fe", text_color="#312e81")

    # Connect Router to Routes
    for rx in [32.75, 51.25, 69.75, 87.25]:
        ax.annotate("", xy=(rx, 43.5), xytext=(22.5, 43.5),
                    arrowprops=dict(arrowstyle="->", color="#6366f1", lw=1.5, ls="--", mutation_scale=12), zorder=6)

    # -------------------------------------------------------------
    # 3. MACHINE LEARNING CORE (Bottom-Left)
    # -------------------------------------------------------------
    draw_card(4, 4, 46, 25, bg_color="#ecfdf5", border_color="#059669", border_width=2.0)
    ml_badge = patches.FancyBboxPatch((6, 26.0), 30, 2.8, boxstyle="Round,pad=0.5,rounding_size=0.5", facecolor="#059669", edgecolor="#047857", zorder=4)
    ax.add_patch(ml_badge)
    ax.text(21, 27.4, "ML INFERENCE ENGINE (Refit v1.0)", ha="center", va="center", fontsize=9.5, fontweight="bold", color="#ffffff", zorder=5)

    draw_item(6, 17, 19.5, 7.5, "Featurizer Engine", "Empirical Bayes (k=10)", bg="#ffffff", border="#a7f3d0", text_color="#065f46")
    draw_item(28, 17, 19.5, 7.5, "HistGradientBoosting", "R² 0.7585 | MAE 1.0270", bg="#d1fae5", border="#10b981", text_color="#064e3b")
    draw_item(6, 6.5, 19.5, 7.5, "Batch LRU Cache", "Deterministic <1ms Speed", bg="#ffffff", border="#a7f3d0", text_color="#065f46")
    draw_item(28, 6.5, 19.5, 7.5, "4PL Curve Simulator", "Sigmoidal 80% CI Bands", bg="#ffffff", border="#a7f3d0", text_color="#065f46")

    # Internal ML connections
    ax.annotate("", xy=(28, 20.75), xytext=(25.5, 20.75),
                arrowprops=dict(arrowstyle="->", color="#059669", lw=1.6, mutation_scale=12), zorder=6)
    ax.annotate("", xy=(37.75, 14), xytext=(37.75, 17),
                arrowprops=dict(arrowstyle="->", color="#059669", lw=1.6, mutation_scale=12), zorder=6)

    # -------------------------------------------------------------
    # 4. STORAGE & ARTIFACTS (Bottom-Right)
    # -------------------------------------------------------------
    draw_card(52, 4, 44, 25, bg_color="#fffbeb", border_color="#d97706", border_width=2.0)
    store_badge = patches.FancyBboxPatch((54, 26.0), 32, 2.8, boxstyle="Round,pad=0.5,rounding_size=0.5", facecolor="#d97706", edgecolor="#b45309", zorder=4)
    ax.add_patch(store_badge)
    ax.text(70, 27.4, "DATASET & PERSISTENT ARTIFACTS", ha="center", va="center", fontsize=9.5, fontweight="bold", color="#ffffff", zorder=5)

    draw_item(54, 17, 19, 7.5, "GDSC2 Screening DB", "242,036 Experimental Curves", bg="#ffffff", border="#fde68a", text_color="#92400e")
    draw_item(75, 17, 19, 7.5, "PCA Landscape Matrix", "963 Cell Lines × 295 Regimens", bg="#ffffff", border="#fde68a", text_color="#92400e")
    draw_item(54, 6.5, 19, 7.5, "COSMIC Cell Directory", "969 Cancer Cell Lines", bg="#ffffff", border="#fde68a", text_color="#92400e")
    draw_item(75, 6.5, 19, 7.5, "Report Archive", "Vector PDFs & CSV Exports", bg="#ffffff", border="#fde68a", text_color="#92400e")

    # -------------------------------------------------------------
    # CROSS-TIER CONNECTING ARROWS
    # -------------------------------------------------------------
    # Client <-> Backend HTTP
    ax.annotate("", xy=(14.25, 48), xytext=(14.25, 63),
                arrowprops=dict(arrowstyle="<->", color="#0d9488", lw=2.5, mutation_scale=16), zorder=7)
    
    # Label for Client-Server Link
    link_badge = patches.FancyBboxPatch((5.5, 54.5), 17.5, 2.8, boxstyle="Round,pad=0.4,rounding_size=0.4", facecolor="#ffffff", edgecolor="#0d9488", linewidth=1.2, zorder=8)
    ax.add_patch(link_badge)
    ax.text(14.25, 55.9, "JSON / REST over HTTP", ha="center", va="center", fontsize=8.0, fontweight="bold", color="#0f766e", zorder=9)

    # Server Predict -> ML Engine
    ax.annotate("", xy=(26, 27), xytext=(32.75, 36),
                arrowprops=dict(arrowstyle="->", color="#4f46e5", lw=2.0, mutation_scale=14), zorder=7)
    
    # Server Sample -> Storage GDSC2
    ax.annotate("", xy=(60, 24), xytext=(51.25, 36),
                arrowprops=dict(arrowstyle="->", color="#d97706", lw=1.8, mutation_scale=14), zorder=7)

    # Server Analytics -> Storage PCA
    ax.annotate("", xy=(78, 24), xytext=(69.75, 36),
                arrowprops=dict(arrowstyle="->", color="#d97706", lw=1.8, mutation_scale=14), zorder=7)

    # Server Reports -> Storage Reports
    ax.annotate("", xy=(85, 14.5), xytext=(87.25, 36),
                arrowprops=dict(arrowstyle="->", color="#d97706", lw=1.8, mutation_scale=14), zorder=7)

    # Tight layout and save
    plt.tight_layout()
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print(f"Diagram successfully generated at: {output_path}")

if __name__ == "__main__":
    create_system_architecture_diagram()
