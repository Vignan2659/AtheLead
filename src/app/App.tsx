import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ROLE_META, type Role } from '../data/users';
import { useCurrentUser } from '../state/store';
import { SignIn } from '../features/auth/SignIn';
import { AthleteToday } from '../features/athlete/Today';
import { AthleteFuel } from '../features/athlete/Fuel';
import { Mission } from '../features/mission/Mission';
import { PassportPage } from '../features/passport/Passport';
import { CoachSquad } from '../features/coach/Squad';
import { BoardHome } from '../features/board/Home';
import { AthleteTrain } from '../features/athlete/Train';
import { AthleteStats } from '../features/athlete/Stats';
import { AthleteCoach } from '../features/athlete/Coach';
import { CoachTrain } from '../features/coach/Train';
import { CoachScout } from '../features/coach/Scout';
import { CoachFixtures } from '../features/coach/Fixtures';
import { CoachSlm } from '../features/coach/Slm';
import { BoardTeams } from '../features/board/Teams';
import { BoardTalent } from '../features/board/Talent';
import { BoardEvents } from '../features/board/Events';
import { BoardSlm } from '../features/board/Slm';
import { EngineScreen } from '../slm/EngineScreen';
import { CoachTests } from '../features/coach/Tests';
import { AthleteWellbeing } from '../features/athlete/Wellbeing';
import { SportDrills } from '../features/athlete/Drills';
import { BoardAdmin } from '../features/board/Admin';
import { GuardianChild, GuardianConsent, GuardianTests } from '../features/guardian/Guardian';
import { DistrictCohorts, DistrictFlags, DistrictTrials } from '../features/district/District';
import { AppShell } from './AppShell';
import { RequireRole } from './RequireRole';
import { Placeholder } from './Placeholder';
import { Onboarding } from './Onboarding';
import { TABS } from './nav';
import { useHtmlLang } from '../i18n';

function Home() {
  const user = useCurrentUser();
  return <Navigate to={user ? ROLE_META[user.role].home : '/signin'} replace />;
}

function roleRoutes(role: Role, home: JSX.Element, extra: Record<string, JSX.Element> = {}) {
  return (
    <Route
      path={`/${role}`}
      element={
        <RequireRole role={role}>
          <AppShell role={role} />
        </RequireRole>
      }
    >
      <Route index element={<Navigate to={TABS[role][0].path} replace />} />
      <Route path={TABS[role][0].path} element={home} />
      {Object.entries(extra).map(([path, el]) => (
        <Route key={path} path={path} element={el} />
      ))}
      <Route path=":tab" element={<Placeholder role={role} />} />
    </Route>
  );
}

export function App() {
  useHtmlLang();
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/passport/:id" element={<PassportPage />} />
          <Route
            path="/athlete/onboarding"
            element={
              <RequireRole role="athlete">
                <Onboarding />
              </RequireRole>
            }
          />
          {roleRoutes('athlete', <AthleteToday />, {
            train: <AthleteTrain />,
            fuel: <AthleteFuel />,
            stats: <AthleteStats />,
            coach: <AthleteCoach />,
            wellbeing: <AthleteWellbeing />,
            drills: <SportDrills />,
            engine: <EngineScreen role="athlete" />,
          })}
          {roleRoutes('coach', <CoachSquad />, {
            train: <CoachTrain />,
            scout: <CoachScout />,
            fixtures: <CoachFixtures />,
            slm: <CoachSlm />,
            tests: <CoachTests />,
            drills: <SportDrills />,
            engine: <EngineScreen role="coach" />,
          })}
          {roleRoutes('board', <BoardHome />, {
            teams: <BoardTeams />,
            talent: <BoardTalent />,
            events: <BoardEvents />,
            slm: <BoardSlm />,
            admin: <BoardAdmin />,
            engine: <EngineScreen role="board" />,
          })}
          {roleRoutes('guardian', <GuardianChild />, {
            tests: <GuardianTests />,
            consent: <GuardianConsent />,
          })}
          {roleRoutes('district', <DistrictFlags />, {
            cohorts: <DistrictCohorts />,
            trials: <DistrictTrials />,
          })}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
