import { createContext, useState, ReactNode, useEffect } from 'react';
import challenges from '../../challenges.json';
import { LevelUPModal } from '../components/LevelUpModal';
import Cookies from 'js-cookie';

interface Challenge {
    type: 'body'|'eye';
    description: string;
    amount: number;
}

interface ChallengesContextData {
    level:number;
    currentXp:number;
    challengesCompleted:number;
    xpForNextLevel:number;
    levelUp:() => void;
    startNewChallenge:() => void;
    activeChallenge: Challenge;
    resetChallenge:() => void;
    completeChallenge:() => void;
    closeLevelUpModal:() => void;
}

interface ChallengesProviderProps {
    children: ReactNode;
    level: number;
    currentXp: number;
    challengesCompleted: number;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({ 
    children ,
    ...rest
}: ChallengesProviderProps) {
    const [level, setLevel] = useState(rest.level ?? 1)
    const [currentXp, setCurrentXp] = useState(rest.currentXp ?? 0)
    const [challengesCompleted, setchallengesCompleted] = useState(rest.challengesCompleted ?? 0)
    const [activeChallenge, setActiveChallenge] = useState(null)
    const xpForNextLevel = Math.pow((level+1)*4,2)

    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false)

    useEffect(() => {
        Notification.requestPermission()
    }, [])

    useEffect(() => {
        Cookies.set('level', String(level))
        Cookies.set('currentXp', String(currentXp))
        Cookies.set('challengesCompleted', String(challengesCompleted))
    }, [level, currentXp, challengesCompleted])
  
    function levelUp() {
      setLevel(level + 1)
      setIsLevelUpModalOpen(true)
    }

    function closeLevelUpModal() {
        setIsLevelUpModalOpen(false)
    }

    function startNewChallenge() {
        const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
        const challenge = challenges[randomChallengeIndex];

        setActiveChallenge(challenge)

        new Audio('/notification.mp3').play()

        if(Notification.permission==='granted') {
            new Notification('New Challenge',{
                body: `Can obtain ${challenge.amount}xp`
            })
        }
    }

    function resetChallenge() {
        setActiveChallenge(null)
    }

    function completeChallenge() {
        if (!activeChallenge) {
            return;
        }
        
        const { amount } = activeChallenge
        let finalXp = currentXp + amount
        if(finalXp>=xpForNextLevel) {
            finalXp = finalXp - xpForNextLevel
            levelUp()
        }

        setCurrentXp(finalXp)
        setActiveChallenge(null)
        setchallengesCompleted(challengesCompleted + 1)
    }

    return (
        <ChallengesContext.Provider value={{ 
            level, 
            currentXp, 
            challengesCompleted, 
            xpForNextLevel,
            levelUp,
            startNewChallenge,
            activeChallenge,
            resetChallenge,
            completeChallenge,
            closeLevelUpModal
        }}>
            { children }
            { isLevelUpModalOpen && <LevelUPModal /> }
        </ChallengesContext.Provider>
    );
}