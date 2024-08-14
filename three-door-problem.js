import { Observable } from "rxjs";

function getChallenge(numDoors) {
  const doors = [];
  const priceIdx = Math.floor(Math.random() * numDoors); // Corrected
  for (let i = 0; i < numDoors; i++) {
    doors.push(
      i === priceIdx
        ? {
            value: "Price",
            closed: true,
            touched: false,
          }
        : {
            value: "Goat",
            closed: true,
            touched: false,
          }
    );
  }
  return doors;
}

function choseDoor(doors) {
  const choicesIdx = doors.reduce(
    (acc, curr, idx) => (curr.closed && !curr.touched ? [...acc, idx] : acc),
    []
  );

  return choicesIdx[Math.floor(Math.random() * choicesIdx.length)];
}

function playGame(numDoors, numTrials, cognitiveDissonanceRatio) {
  let win = 0;
  const doors = getChallenge(numDoors);

  let firstChoice = choseDoor(doors);

  for (let i = 0; i < numTrials; i++) {
    // chose a door to open
    let choseIdx;

    const cognitiveDissonance = Math.random() < cognitiveDissonanceRatio;
    if (cognitiveDissonance) {
      choseIdx = firstChoice;
    } else {
      choseIdx = choseDoor(doors);
    }

    doors[choseIdx].closed = false;
    doors[choseIdx].touched = true;

    if (doors[choseIdx].value === "Price") {
      return {
        winner: true,
        trials: i,
      };
    }

    // reveal a new goat door
    const goatIdxs = doors.reduce(
      (acc, curr, idx) =>
        curr.value === "Goat" && !curr.closed ? [...acc, idx] : acc,
      []
    );

    const newChoiceIdx = Math.floor(Math.random() * goatIdxs.length);

    doors[goatIdxs[newChoiceIdx]].closed = false;
    doors[goatIdxs[newChoiceIdx]].touched = true;
  }

  return {
    winner: false,
    trials: numTrials - 1,
  };
}

export function stats(samples, numGames, numDoors, numTrials) {
  return new Observable((subscriber) => {
    (async () => {
      //const numGames = 100;
      //const numDoors = 3;
      //const numTrials = 2;
      const trials = new Array(numTrials).fill(0);

      const cognitiveDissonanceDelta = 1 / samples;

      for (let i = 0; i < samples; i++) {
        const cognitiveDissonanceRatio = i * cognitiveDissonanceDelta;

        let wins = 0;
        for (let games = 0; games < numGames; games++) {
          const result = playGame(
            numDoors,
            numTrials,
            cognitiveDissonanceRatio
          );
          if (result.winner) {
            wins++;
            trials[result.trials]++;
          }
        }

        // Emit data as an object
        subscriber.next({
          cognitiveDissonance: Math.floor(cognitiveDissonanceRatio * 100),
          winPercentage: Math.floor((wins / numGames) * 100),
        });

        await new Promise((resolve) => setTimeout(resolve, 5)); // Wait for
      }

      // Complete the observable
      subscriber.complete();
    })();
  });
}

//stats(100);
