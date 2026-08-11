"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/dashboard/Badge";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { SelectField, TextField } from "@/components/auth/fields";
import { api, ApiError } from "@/lib/api";
import { formatDateFr } from "@/lib/format";
import type { BalanceSummary, ReputationOverview, User } from "@/lib/types";

const USAGE_OPTIONS = [
  { value: "otp", label: "Codes OTP" },
  { value: "notifications", label: "Notifications" },
  { value: "receipts", label: "Reçus et factures" },
  { value: "other", label: "Autre" },
];

const KNOWN_USAGE_VALUES = USAGE_OPTIONS.map((option) => option.value);

const ROLE_META: Record<string, { label: string; color: "blue" | "gray" }> = {
  ADMIN: { label: "Administrateur", color: "blue" },
  CUSTOMER: { label: "Client", color: "gray" },
};

const VERDICT_META: Record<
  string,
  { label: string; color: "green" | "orange" | "red" }
> = {
  OK: { label: "Bonne réputation", color: "green" },
  WARNING: { label: "À surveiller", color: "orange" },
  SUSPEND: { label: "Suspendu", color: "red" },
};

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Impossible de joindre le serveur.";
}

interface ProfileFormValues {
  name: string;
  company: string;
  declaredUsage: string;
}

export default function DashboardProfilPage() {
  const router = useRouter();

  // --- Compte + formulaire de profil -------------------------------------
  const [user, setUser] = useState<User | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [values, setValues] = useState<ProfileFormValues>({
    name: "",
    company: "",
    declaredUsage: "",
  });
  const [initialValues, setInitialValues] = useState<ProfileFormValues>({
    name: "",
    company: "",
    declaredUsage: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- Changement de mot de passe -----------------------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmingPasswordChange, setConfirmingPasswordChange] =
    useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // --- Résumé : solde + réputation -----------------------------------------
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const [reputation, setReputation] = useState<ReputationOverview | null>(
    null
  );
  const [reputationSuspended, setReputationSuspended] = useState(false);
  const [reputationError, setReputationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await api.get<User>("/v1/auth/me");
        if (!active) return;
        setUser(data);
        const loaded: ProfileFormValues = {
          name: data.name,
          company: data.company ?? "",
          declaredUsage: data.declaredUsage ?? "",
        };
        setValues(loaded);
        setInitialValues(loaded);
      } catch (err) {
        if (!active) return;
        setLoadError(errorMessage(err));
      }
    })();

    (async () => {
      try {
        const data = await api.get<BalanceSummary>("/v1/billing/balance");
        if (!active) return;
        setBalance(data);
      } catch (err) {
        if (!active) return;
        setBalanceError(errorMessage(err));
      }
    })();

    (async () => {
      try {
        const data = await api.get<ReputationOverview>("/v1/reputation");
        if (!active) return;
        setReputation(data);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 403) {
          setReputationSuspended(true);
        } else {
          setReputationError(errorMessage(err));
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const dirty =
    values.name !== initialValues.name ||
    values.company !== initialValues.company ||
    values.declaredUsage !== initialValues.declaredUsage;

  const usageOptions =
    initialValues.declaredUsage &&
    !KNOWN_USAGE_VALUES.includes(initialValues.declaredUsage)
      ? [
          ...USAGE_OPTIONS,
          {
            value: initialValues.declaredUsage,
            label: initialValues.declaredUsage,
          },
        ]
      : USAGE_OPTIONS;

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || saving) return;

    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);

    try {
      const updated = await api.patch<User>("/v1/auth/me", {
        name: values.name,
        company: values.company,
        declaredUsage: values.declaredUsage,
      });
      setUser(updated);
      const loaded: ProfileFormValues = {
        name: updated.name,
        company: updated.company ?? "",
        declaredUsage: updated.declaredUsage ?? "",
      };
      setValues(loaded);
      setInitialValues(loaded);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordChanged(false);

    if (newPassword.length < 8) {
      setPasswordError("8 caractères minimum pour le nouveau mot de passe.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setConfirmingPasswordChange(true);
  }

  async function handleConfirmPasswordChange() {
    setChangingPassword(true);
    setPasswordError(null);

    try {
      await api.post<void>("/v1/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setConfirmingPasswordChange(false);
      setPasswordChanged(true);
      window.setTimeout(() => {
        router.push("/connexion");
      }, 1800);
    } catch (err) {
      setConfirmingPasswordChange(false);
      setChangingPassword(false);
      if (err instanceof ApiError && err.status === 401) {
        setPasswordError("Mot de passe actuel incorrect.");
      } else {
        setPasswordError(errorMessage(err));
      }
    }
  }

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6">
      <div>
        <h1 className="mb-1.5 font-heading text-2xl font-semibold text-[#EDEEF0]">
          Profil
        </h1>
        <p className="text-sm text-[#9BA1A8]">
          Gérez vos informations de compte, votre mot de passe et consultez
          votre réputation d’envoi.
        </p>
      </div>

      {loadError && (
        <p className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
          {loadError}
        </p>
      )}

      {!user && !loadError && (
        <p className="text-sm text-[#9BA1A8]">Chargement…</p>
      )}

      {user && (
        <>
          {/* --- Informations du compte --------------------------------- */}
          <section className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6">
            <h2 className="mb-1.5 font-heading text-lg font-semibold text-[#EDEEF0]">
              Informations du compte
            </h2>
            <p className="mb-5 text-[13.5px] text-[#9BA1A8]">
              Ces informations nous aident à personnaliser votre expérience
              Zendou.
            </p>

            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-medium text-[#C5CACF]">
                Email
              </label>
              <div className="w-full rounded-lg border border-white/[0.09] bg-white/[0.02] px-3.5 py-2.5 text-[15px] text-[#9BA1A8]">
                {user.email}
              </div>
              <p className="mt-1.5 text-[12.5px] text-[#70767D]">
                L’adresse email ne peut pas être modifiée : c’est votre
                identifiant de connexion.
              </p>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="flex flex-col gap-4"
            >
              <TextField
                label="Nom"
                name="name"
                type="text"
                required
                minLength={2}
                value={values.name}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, name: event.target.value }))
                }
              />
              <TextField
                label="Entreprise"
                name="company"
                type="text"
                value={values.company}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    company: event.target.value,
                  }))
                }
              />
              <SelectField
                label="Utilisation prévue"
                name="declaredUsage"
                placeholder="Non précisé"
                options={usageOptions}
                value={values.declaredUsage}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    declaredUsage: event.target.value,
                  }))
                }
              />

              {saveError && (
                <p className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
                  {saveError}
                </p>
              )}
              {saveSuccess && (
                <p className="rounded-lg border border-[#35D07F]/25 bg-[#35D07F]/10 px-3.5 py-2.5 text-[13.5px] text-[#35D07F]">
                  Profil mis à jour
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={!dirty || saving}
                  className="rounded-lg bg-[#5B7CFA] px-5 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity disabled:opacity-40"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </section>

          {/* --- Changer le mot de passe --------------------------------- */}
          <section className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6">
            <h2 className="mb-1.5 font-heading text-lg font-semibold text-[#EDEEF0]">
              Changer le mot de passe
            </h2>
            <p className="mb-5 text-[13.5px] text-[#9BA1A8]">
              Choisissez un mot de passe difficile à deviner.
            </p>

            <form
              onSubmit={handlePasswordSubmit}
              className="flex flex-col gap-4"
            >
              <TextField
                label="Mot de passe actuel"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <TextField
                label="Nouveau mot de passe"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                hint="8 caractères minimum"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <TextField
                label="Confirmer le nouveau mot de passe"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />

              <p className="rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10 px-3.5 py-2.5 text-[13px] text-[#F5C177]">
                Vous serez déconnecté de tous vos appareils après le
                changement.
              </p>

              {passwordError && (
                <p className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3.5 py-2.5 text-[13.5px] text-[#FF9592]">
                  {passwordError}
                </p>
              )}
              {passwordChanged && (
                <p className="rounded-lg border border-[#35D07F]/25 bg-[#35D07F]/10 px-3.5 py-2.5 text-[13.5px] text-[#35D07F]">
                  Mot de passe modifié. Redirection vers la connexion…
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={changingPassword || passwordChanged}
                  className="rounded-lg bg-[#5B7CFA] px-5 py-2.5 text-[13.5px] font-semibold text-[#F7F9FF] transition-opacity disabled:opacity-40"
                >
                  {changingPassword ? "Modification…" : "Changer le mot de passe"}
                </button>
              </div>
            </form>
          </section>

          {/* --- Résumé du compte ----------------------------------------- */}
          <section className="rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6">
            <h2 className="mb-5 font-heading text-lg font-semibold text-[#EDEEF0]">
              Résumé du compte
            </h2>

            <dl className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryItem label="Rôle">
                <Badge
                  color={ROLE_META[user.role]?.color ?? "gray"}
                  label={ROLE_META[user.role]?.label ?? user.role}
                />
              </SummaryItem>
              <SummaryItem label="Statut">
                {user.status === "ACTIVE" ? (
                  <Badge color="green" label="Actif" />
                ) : (
                  <Badge color="red" label="Suspendu" />
                )}
              </SummaryItem>
              <SummaryItem label="Membre depuis">
                <span className="text-[14px] text-[#EDEEF0]">
                  {formatDateFr(user.createdAt)}
                </span>
              </SummaryItem>
              <SummaryItem label="Limite journalière d’envoi">
                <span className="font-mono text-[14px] text-[#EDEEF0]">
                  {user.dailySendLimit.toLocaleString("fr-FR")} emails / jour
                </span>
              </SummaryItem>
              <SummaryItem label="Solde de crédits">
                {balanceError ? (
                  <span className="text-[13px] text-[#FF9592]">
                    {balanceError}
                  </span>
                ) : balance ? (
                  <span className="font-mono text-[14px] text-[#EDEEF0]">
                    {balance.balance.toLocaleString("fr-FR")} crédits
                  </span>
                ) : (
                  <span className="text-[13px] text-[#9BA1A8]">
                    Chargement…
                  </span>
                )}
              </SummaryItem>
            </dl>

            <h3 className="mb-3 text-[13px] font-medium text-[#C5CACF]">
              Réputation d’envoi
            </h3>

            {reputationSuspended ? (
              <div className="rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-4 py-3">
                <p className="text-[13.5px] font-medium text-[#FF9592]">
                  Compte suspendu
                </p>
                <p className="mt-1 text-[12.5px] text-[#FF9592]/80">
                  Votre compte est suspendu suite à un taux de rebonds ou de
                  plaintes trop élevé. Contactez le support pour en savoir
                  plus.
                </p>
              </div>
            ) : reputationError ? (
              <p className="text-[13px] text-[#FF9592]">{reputationError}</p>
            ) : !reputation ? (
              <p className="text-[13px] text-[#9BA1A8]">Chargement…</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SummaryItem label="Envois (30 derniers jours)">
                  <span className="font-mono text-[14px] text-[#EDEEF0]">
                    {reputation.sent.toLocaleString("fr-FR")}
                  </span>
                </SummaryItem>
                <SummaryItem label="Rebonds durs">
                  <span className="font-mono text-[14px] text-[#EDEEF0]">
                    {reputation.hardBounces.toLocaleString("fr-FR")}
                  </span>
                </SummaryItem>
                <SummaryItem label="Plaintes">
                  <span className="font-mono text-[14px] text-[#EDEEF0]">
                    {reputation.complaints.toLocaleString("fr-FR")}
                  </span>
                </SummaryItem>
                <SummaryItem label="Verdict">
                  <Badge
                    color={VERDICT_META[reputation.verdict]?.color ?? "gray"}
                    label={
                      VERDICT_META[reputation.verdict]?.label ??
                      reputation.verdict
                    }
                  />
                </SummaryItem>
              </div>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={confirmingPasswordChange}
        title="Changer le mot de passe ?"
        description="Vous serez déconnecté de tous vos appareils après le changement, y compris celui-ci. Vous devrez vous reconnecter avec votre nouveau mot de passe."
        confirmLabel="Changer le mot de passe"
        loading={changingPassword}
        onConfirm={handleConfirmPasswordChange}
        onCancel={() => setConfirmingPasswordChange(false)}
      />
    </div>
  );
}

function SummaryItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="mb-1 text-[12.5px] text-[#70767D]">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
