export interface Quote {
  text: string
  author: string
}

/**
 * 120 curated quotes spanning discipline, faith, perseverance, consistency,
 * gratitude, growth, prayer and purpose. Attributions are to real, non-controversial
 * historical figures, proverbs, or scripture.
 */
export const QUOTES: Quote[] = [
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'The secret of your future is hidden in your daily routine.', author: 'Mike Murdock' },
  { text: 'Small disciplines repeated with consistency every day lead to great achievements.', author: 'John C. Maxwell' },
  { text: 'Motivation gets you going, but discipline keeps you growing.', author: 'John C. Maxwell' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese Proverb' },
  { text: 'Perseverance is not a long race; it is many short races one after the other.', author: 'Walter Elliot' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'Little by little, one travels far.', author: 'Spanish Proverb' },
  { text: 'A river cuts through rock not because of its power but its persistence.', author: 'James N. Watkins' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Do not pray for an easy life; pray for the strength to endure a difficult one.', author: 'Bruce Lee' },
  { text: 'Faith is taking the first step even when you do not see the whole staircase.', author: 'Martin Luther King Jr.' },
  { text: 'Gratitude turns what we have into enough.', author: 'Aesop' },
  { text: 'The grateful heart sits at a continual feast.', author: 'Proverb' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'The best way to predict the future is to create it.', author: 'Abraham Lincoln' },
  { text: 'What we plant in the soil of contemplation, we shall reap in the harvest of action.', author: 'Meister Eckhart' },
  { text: 'Prayer does not change God, but it changes the one who prays.', author: 'Soren Kierkegaard' },
  { text: 'Be faithful in small things because it is in them that your strength lies.', author: 'Mother Teresa' },
  { text: 'The purpose of life is a life of purpose.', author: 'Robert Byrne' },
  { text: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
  { text: 'Patience and perseverance have a magical effect before which difficulties disappear.', author: 'John Quincy Adams' },
  { text: 'Consistency is what transforms average into excellence.', author: 'Proverb' },
  { text: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
  { text: 'The man who moves a mountain begins by carrying away small stones.', author: 'Confucius' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Our greatest glory is not in never falling, but in rising every time we fall.', author: 'Confucius' },
  { text: 'Trust in the Lord with all your heart and lean not on your own understanding.', author: 'Proverbs 3:5' },
  { text: 'This is the day the Lord has made; let us rejoice and be glad in it.', author: 'Psalm 118:24' },
  { text: 'Commit your work to the Lord, and your plans will be established.', author: 'Proverbs 16:3' },
  { text: 'I can do all things through him who strengthens me.', author: 'Philippians 4:13' },
  { text: 'Be strong and courageous. Do not be afraid.', author: 'Joshua 1:9' },
  { text: 'Let us not grow weary of doing good, for in due season we will reap.', author: 'Galatians 6:9' },
  { text: 'Give thanks in all circumstances.', author: '1 Thessalonians 5:18' },
  { text: 'The steadfast love of the Lord never ceases; his mercies are new every morning.', author: 'Lamentations 3:22-23' },
  { text: 'Whatever you do, work at it with all your heart.', author: 'Colossians 3:23' },
  { text: 'Cast all your anxiety on him because he cares for you.', author: '1 Peter 5:7' },
  { text: 'Patience is bitter, but its fruit is sweet.', author: 'Aristotle' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Whether you think you can or think you cannot, you are right.', author: 'Henry Ford' },
  { text: 'Genius is one percent inspiration and ninety-nine percent perspiration.', author: 'Thomas Edison' },
  { text: 'I have not failed. I have just found ten thousand ways that will not work.', author: 'Thomas Edison' },
  { text: 'Opportunity is missed by most people because it is dressed in overalls and looks like work.', author: 'Thomas Edison' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  { text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.', author: 'Mahatma Gandhi' },
  { text: 'Be the change that you wish to see in the world.', author: 'Mahatma Gandhi' },
  { text: 'Strength does not come from physical capacity. It comes from an indomitable will.', author: 'Mahatma Gandhi' },
  { text: 'A goal without a plan is just a wish.', author: 'Antoine de Saint-Exupery' },
  { text: 'Perfection is not attainable, but if we chase perfection we can catch excellence.', author: 'Vince Lombardi' },
  { text: 'The difference between the impossible and the possible lies in determination.', author: 'Tommy Lasorda' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Nothing worth having comes easy.', author: 'Theodore Roosevelt' },
  { text: 'Courage is not having the strength to go on; it is going on when you have no strength.', author: 'Theodore Roosevelt' },
  { text: 'The harder the conflict, the more glorious the triumph.', author: 'Thomas Paine' },
  { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson' },
  { text: 'Write it on your heart that every day is the best day in the year.', author: 'Ralph Waldo Emerson' },
  { text: 'The only person you are destined to become is the person you decide to be.', author: 'Ralph Waldo Emerson' },
  { text: 'Cultivate the habit of being grateful for every good thing that comes to you.', author: 'Ralph Waldo Emerson' },
  { text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.', author: 'Ralph Waldo Emerson' },
  { text: 'For every minute spent organizing, an hour is earned.', author: 'Benjamin Franklin' },
  { text: 'By failing to prepare, you are preparing to fail.', author: 'Benjamin Franklin' },
  { text: 'Lost time is never found again.', author: 'Benjamin Franklin' },
  { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
  { text: 'Either write something worth reading or do something worth writing.', author: 'Benjamin Franklin' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Twenty years from now you will be more disappointed by the things you did not do.', author: 'Mark Twain' },
  { text: 'Continuous improvement is better than delayed perfection.', author: 'Mark Twain' },
  { text: 'Kindness is a language which the deaf can hear and the blind can see.', author: 'Mark Twain' },
  { text: 'The two most important days in your life are the day you are born and the day you find out why.', author: 'Mark Twain' },
  { text: 'You miss one hundred percent of the shots you do not take.', author: 'Wayne Gretzky' },
  { text: 'It is not the load that breaks you down, it is the way you carry it.', author: 'Lou Holtz' },
  { text: 'Hardships often prepare ordinary people for an extraordinary destiny.', author: 'C.S. Lewis' },
  { text: 'You are never too old to set another goal or to dream a new dream.', author: 'C.S. Lewis' },
  { text: 'Integrity is doing the right thing even when no one is watching.', author: 'C.S. Lewis' },
  { text: 'Humility is not thinking less of yourself, it is thinking of yourself less.', author: 'C.S. Lewis' },
  { text: 'We are what we believe we are.', author: 'C.S. Lewis' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'The greatest weapon against stress is our ability to choose one thought over another.', author: 'William James' },
  { text: 'Nothing is worth more than this day.', author: 'Johann Wolfgang von Goethe' },
  { text: 'Knowing is not enough; we must apply. Willing is not enough; we must do.', author: 'Johann Wolfgang von Goethe' },
  { text: 'Whatever you can do or dream you can, begin it. Boldness has genius and power in it.', author: 'Johann Wolfgang von Goethe' },
  { text: 'A journey of self-discovery starts with a single honest question.', author: 'Proverb' },
  { text: 'Fear less, hope more; eat less, chew more; whine less, breathe more.', author: 'Swedish Proverb' },
  { text: 'When the roots are deep, there is no reason to fear the wind.', author: 'African Proverb' },
  { text: 'Smooth seas do not make skillful sailors.', author: 'African Proverb' },
  { text: 'However long the night, the dawn will break.', author: 'African Proverb' },
  { text: 'If you want to go fast, go alone. If you want to go far, go together.', author: 'African Proverb' },
  { text: 'A wise man will make more opportunities than he finds.', author: 'Francis Bacon' },
  { text: 'Begin at once to live, and count each separate day as a separate life.', author: 'Seneca' },
  { text: 'Luck is what happens when preparation meets opportunity.', author: 'Seneca' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca' },
  { text: 'Difficulties strengthen the mind, as labor does the body.', author: 'Seneca' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
  { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
  { text: 'It is not what happens to you, but how you react to it that matters.', author: 'Epictetus' },
  { text: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius' },
  { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'When you arise in the morning, think of what a privilege it is to be alive.', author: 'Marcus Aurelius' },
  { text: 'Very little is needed to make a happy life; it is all within yourself.', author: 'Marcus Aurelius' },
  { text: 'The soul becomes dyed with the color of its thoughts.', author: 'Marcus Aurelius' },
  { text: 'How we spend our days is, of course, how we spend our lives.', author: 'Annie Dillard' },
  { text: 'The mind is everything. What you think you become.', author: 'Buddha' },
  { text: 'Better than a thousand hollow words is one word that brings peace.', author: 'Buddha' },
  { text: 'Drop by drop is the water pot filled.', author: 'Buddha' },
  { text: 'Your work is to discover your work and then give yourself to it wholeheartedly.', author: 'Buddha' },
  { text: 'Peace comes from within. Do not seek it without.', author: 'Buddha' },
  { text: 'Gratitude is the memory of the heart.', author: 'Jean-Baptiste Massieu' },
  { text: 'Silent gratitude is not much use to anyone.', author: 'G.B. Stern' },
  { text: 'When we give cheerfully and accept gratefully, everyone is blessed.', author: 'Maya Angelou' },
  { text: 'Nothing will work unless you do.', author: 'Maya Angelou' },
  { text: 'We may encounter many defeats but we must not be defeated.', author: 'Maya Angelou' },
  { text: 'Try to be a rainbow in someone else\'s cloud.', author: 'Maya Angelou' },
  { text: 'Growth is the only evidence of life.', author: 'John Henry Newman' },
  { text: 'To grow, you must be willing to let your present and future be totally unlike your past.', author: 'Proverb' },
  { text: 'The roots of education are bitter, but the fruit is sweet.', author: 'Aristotle' },
]

let lastIndex = -1

/** Return a random quote, avoiding immediate repeats. */
export function randomQuote(): Quote {
  if (QUOTES.length === 0) return { text: '', author: '' }
  let idx = Math.floor(Math.random() * QUOTES.length)
  if (QUOTES.length > 1) {
    while (idx === lastIndex) idx = Math.floor(Math.random() * QUOTES.length)
  }
  lastIndex = idx
  return QUOTES[idx]
}

/** Deterministic quote-of-the-day based on the date key. */
export function quoteForDay(dateKey: string): Quote {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0
  }
  return QUOTES[hash % QUOTES.length]
}
