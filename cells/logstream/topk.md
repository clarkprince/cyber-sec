So early termination was something I was aware of but never really investigated. I assumed it was a simple case of,

    We have 1,000 results and you are only going to look at 20 of them so lets stop processing and return what we have already

Then I started reading about early termination algorithms and stumbled into a huge branch of research I never knew existed. A few links about it that I found are included below.

    https://www.usenix.org/system/files/conference/atc18/atc18-gong.pdf
    https://github.com/migotom/heavykeeper/blob/master/heavy_keeper.go
    https://medium.com/@ariel.shtul/-what-is-tok-k-and-how-is-it-done-in-redisbloom-module-acd9316b35bd
    https://www.microsoft.com/en-us/research/wp-content/uploads/2012/08/topk.pdf
    http://fontoura.org/papers/lsdsir2013.pdf
    https://www.researchgate.net/profile/Zemani-Imene-Mansouria/publication/333435122_MWAND_A_New_Early_Termination_Algorithm_for_Fast_and_Efficient_Query_Evaluation/links/5d0606a5a6fdcc39f11e3f0f/MWAND-A-New-Early-Termination-Algorithm-for-Fast-and-Efficient-Query-Evaluation.pdf
    https://dl.acm.org/doi/10.1145/1060745.1060785
