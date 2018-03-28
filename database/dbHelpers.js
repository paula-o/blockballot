const db = require('./index.js');

const createPoll = (orgId, pollOptions) => {
  return db.Poll.create({ 
    orgId: orgId,
    pollName: pollOptions.pollName,
    pollTimeStart: pollOptions.pollStart,
    pollTimeEnd: pollOptions.pollEnd,
    pollHash: pollOptions.pollAddress
  })
}

const createOption = (pollId, optionName) => {
  return db.Option.create({
    optionName: optionName,
    pollId: pollId
  });
}

const saveVoterID = (voteID, pollId) => {
  return db.VoteKey.create({
    voterUniqueId: voteID,
    pollId: pollId
  })
}

const retrievePolls = (orgId) => {
  return new Promise((resolve, reject) => {
    db.sequelize.query(`SELECT p.pollName, p.pollTimeStart, p.pollTimeEnd, p.pollHash,
                        p.orgId, GROUP_CONCAT(o.optionName) as options,
                        GROUP_CONCAT(o.id) as optionIds, o.pollId
                        FROM polls p
                        JOIN options o
                        ON o.pollId = p.id
                        WHERE p.orgId = ${orgId} GROUP BY o.pollId;`, { type: db.sequelize.QueryTypes.SELECT})
    .then(result => {
      resolve(result);
    })
    .catch(err => {
      reject(err);
    });
  });
}

const retrieveVoteCount = (optionId) => {
  return new Promise((resolve, reject) => {
    db.Vote.count({ where: { optionId: optionId }})
    .then(count => {
      resolve(count);
    })
    .catch(err => {
      reject(err);
    })
  })
}

// helper function that takes in a poll object from retrievePolls query
// and bundles it with optionName: voteCounts
const bundlePollVotes = (poll) => {
  return new Promise((resolve, reject) => {
    let promiseArr = [];
    poll.optionIds.split(',').forEach(id => {
      promiseArr.push(retrieveVoteCount(id))
    });
    Promise.all(promiseArr)
    .then(counts => {
      const options = poll.options.split(',');
      const optionVotes = [];
      let voteCount = 0;
      counts.forEach((count, index) => {
        let optionCount = {};
        optionCount[options[index]] = count;
        voteCount += count;
        optionVotes.push(optionCount);
      })
      poll.optionVotes = optionVotes;
      poll.voteCount = voteCount;
      resolve(poll);
    })
    .catch(err => {
      reject(err);
    });
  });
}

exports.createPoll = createPoll;
exports.createOption = createOption;
exports.retrievePolls = retrievePolls;
exports.retrieveVoteCount = retrieveVoteCount;
exports.bundlePollVotes = bundlePollVotes;
exports.saveVoterID = saveVoterID;